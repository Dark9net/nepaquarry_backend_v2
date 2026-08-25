const crypto = require("crypto");
const { hashPassword, isPasswordValid } = require("../lib/password");

const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const { getTransporter, getMailConfig } = require("../lib/mail");
const { buildPasswordOtpEmail } = require("../lib/password-otp-email");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  hashToken,
  expiresAt,
} = require("../lib/tokens");
const { readDeviceContext } = require("../lib/device");
const {
  claimDeviceSeat,
  releaseDeviceSeat,
  releaseAllUserSeats,
  touchDeviceSeat,
} = require("./deviceSession.service");

const invalidCredentials = () => new AppError(401, "Invalid email, password, or organization");
// Organization.name carries no unique constraint (only `slug` does), so a
// name can match more than one row. Signing whoever sorts first into an
// arbitrary org would be a cross-tenant bug, so an ambiguous name is refused
// outright and the operator is told to resolve the collision.
const ambiguousOrganization = () =>
  new AppError(409, "More than one organization uses that name. Contact your administrator.");
const invalidSession = () => new AppError(401, "Session has expired. Please sign in again");
const invalidRecoveryAccount = () => new AppError(404, "No active account matches that email and organization.");
const invalidOtp = () => new AppError(400, "The verification code is invalid or has expired.");
// Flagged so controllers can tell this apart from an ordinary 403 and tear
// the session down (revoke refresh tokens + clear auth cookies) instead of
// leaving valid credentials in the browser. Without that teardown a renewed
// subscription would silently resurrect the old session on the next request.
const subscriptionExpired = () => {
  const error = new AppError(403, "Your plan expires. Renew to gain access to your system.");
  error.subscriptionExpired = true;
  return error;
};

// A subscription that exists but has never been paid for (INCOMPLETE /
// PAST_DUE / UNPAID) blocks sign-in the same way an expired one does, and a
// cancelled one gets its own wording. Flagged like `subscriptionExpired` so
// the controller tears the session down instead of leaving live cookies in a
// browser whose org cannot actually use the system.
const subscriptionNotActive = (status) => {
  const message =
    status === "CANCELED"
      ? "Your payment has been cancelled"
      : "Your payment is still pending";
  const error = new AppError(403, message);
  error.subscriptionExpired = true;
  error.subscriptionStatus = status;
  return error;
};
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

// The most recently started subscription is treated as the org's current
// plan (mirrors subscription.service.js's getCurrentSubscription). An org
// with no subscription row at all is left alone here rather than blocked,
// since that predates the checkout feature and blocking would lock out
// every pre-existing organization.
const assertSubscriptionActive = async (orgId) => {
  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: orgId },
    select: { status: true, SubscriptionEndsAt: true },
    orderBy: { SubscriptionStartsAt: "desc" },
  });

  // No subscription row at all is still left alone (see the note above): it
  // means the org predates checkout, and blocking would lock out every
  // pre-existing organization.
  if (!subscription) return;

  // Only ACTIVE may sign in. CANCELED gets the cancellation wording; every
  // other non-active state (INCOMPLETE, PAST_DUE, UNPAID) reads as payment
  // still pending, which is what those states mean to a customer.
  if (subscription.status !== "ACTIVE") {
    throw subscriptionNotActive(subscription.status);
  }

  // An ACTIVE row can still be past its end date if no renewal job has run,
  // so the date check stays as the second gate.
  if (subscription.SubscriptionEndsAt && subscription.SubscriptionEndsAt <= new Date()) {
    throw subscriptionExpired();
  }
};

const toSession = (member) => ({
  userId: member.user.id,
  memberId: member.id,
  orgId: member.org.id,
  role: member.role,
});

const toSessionPayload = (member) => ({
  memberId: member.id,
  user: {
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    mustChangePassword: member.user.mustChangePassword,
  },
  role: member.role,
  org: {
    id: member.org.id,
    name: member.org.name,
    slug: member.org.slug,
  },
});

const logLoginAttempt = async ({ userId = null, request, status }) => {
  try {
    await prisma.loginAttempt.create({
      data: {
        userId,
        status,
        ipAddress: request.ip || null,
        userAgent: request.get("user-agent")?.slice(0, 512) || null,
      },
    });
  } catch {
    // Authentication must not fail merely because audit logging is unavailable.
  }
};

// `org` is merged rather than reassigned. Spreading `where` and then writing
// a second `org` key would silently drop the caller's org filter (a duplicate
// key in an object literal keeps the last value), which let any org slug match
// a member as long as the email existed somewhere. The org constraint is the
// whole point of a multi-tenant sign-in, so it is combined explicitly here.
const findActiveMember = ({ org, ...where }) =>
  prisma.organizationMember.findFirst({
    where: {
      ...where,
      isActive: true,
      org: { ...org, isActive: true },
    },
    include: {
      user: true,
      org: true,
    },
  });

const issueSession = async (member, device) => {
  const session = { ...toSession(member), sessionId: crypto.randomUUID() };
  const refreshToken = createRefreshToken(session);
  const accessToken = createAccessToken(session);

  // Claiming the device seat and storing the refresh token happen in one
  // transaction so a login can never end up with a usable token but no seat
  // (or a seat consumed by a login that then failed). The seat check reads
  // and writes the same rows a competing login would, so the transaction is
  // also what makes the membercount cap safe against two simultaneous
  // logins racing past the limit.
  await prisma.$transaction(async (transaction) => {
    if (device) {
      await claimDeviceSeat(transaction, {
        orgId: session.orgId,
        userId: session.userId,
        device,
      });
    }

    await transaction.refreshToken.create({
      data: {
        id: session.sessionId,
        userId: session.userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: expiresAt(refreshToken),
      },
    });
  });

  return { accessToken, refreshToken };
};

const login = async ({ email, password, orgName }, request) => {
  // The name is resolved to exactly one organization first. `take: 2` is
  // enough to detect a collision without loading every namesake, and the
  // lookup is a plain equality because the column's _ci collation already
  // matches case-insensitively.
  const organizations = await prisma.organization.findMany({
    where: { name: orgName, isActive: true },
    select: { id: true },
    take: 2,
  });

  if (organizations.length > 1) {
    await logLoginAttempt({ request, status: "FAILED" });
    throw ambiguousOrganization();
  }

  // A name matching no active org is reported exactly like a bad password:
  // this endpoint is unauthenticated, so distinguishing the two would let it
  // be used to enumerate which organizations exist.
  const member = organizations.length
    ? await findActiveMember({
        user: { email },
        orgId: organizations[0].id,
      })
    : null;

  if (!member) {
    await logLoginAttempt({ request, status: "FAILED" });
    throw invalidCredentials();
  }

  const validPassword = await isPasswordValid(member.user.password, password);

  if (!validPassword) {
    await logLoginAttempt({ userId: member.user.id, request, status: "FAILED" });
    throw invalidCredentials();
  }

  await assertSubscriptionActive(member.org.id);

  // Device seat is claimed inside issueSession's transaction. A rejection
  // here (org is at its plan's membercount) is a failed sign-in, so it is
  // recorded as one before the error propagates.
  let tokens;
  try {
    tokens = await issueSession(member, readDeviceContext(request));
  } catch (error) {
    if (error.deviceLimitReached) {
      await logLoginAttempt({ userId: member.user.id, request, status: "FAILED" });
    }
    throw error;
  }

  await logLoginAttempt({ userId: member.user.id, request, status: "SUCCESS" });

  return { tokens, session: toSessionPayload(member) };
};

const refresh = async (rawRefreshToken, request) => {
  if (!rawRefreshToken) {
    throw invalidSession();
  }

  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw invalidSession();
  }

  const tokenHash = hashToken(rawRefreshToken);
  const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!storedToken || storedToken.userId !== payload.sub || storedToken.id !== payload.sid) {
    throw invalidSession();
  }

  if (storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
    if (storedToken.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    throw invalidSession();
  }

  const member = await findActiveMember({
    id: payload.memberId,
    userId: payload.sub,
    orgId: payload.orgId,
  });

  if (!member) {
    throw invalidSession();
  }

  // Refreshing is how a long-lived session stays alive, so the subscription
  // has to be re-checked here too — otherwise an org whose plan lapsed could
  // keep minting fresh access tokens indefinitely.
  try {
    await assertSubscriptionActive(member.org.id);
  } catch (error) {
    if (error.subscriptionExpired) {
      await revokeAllSessions(member.user.id);
    }
    throw error;
  }

  // A device whose seat was taken over or revoked elsewhere must not be able
  // to keep renewing its access token, so the seat is re-checked on every
  // refresh rather than only at login.
  if (request) {
    const device = readDeviceContext(request);
    const seat = await prisma.userSession.findUnique({
      where: { orgId_deviceId: { orgId: member.org.id, deviceId: device.deviceId } },
      select: { revokedAt: true },
    });

    if (seat && seat.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { id: storedToken.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw invalidSession();
    }

    await touchDeviceSeat({ orgId: member.org.id, deviceId: device.deviceId });
  }

  const session = { ...toSession(member), sessionId: crypto.randomUUID() };
  const nextRefreshToken = createRefreshToken(session);
  const nextAccessToken = createAccessToken(session);
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const revokeResult = await transaction.refreshToken.updateMany({
      where: { id: storedToken.id, revokedAt: null },
      data: { revokedAt: now },
    });

    if (revokeResult.count !== 1) {
      throw invalidSession();
    }

    await transaction.refreshToken.create({
      data: {
        id: session.sessionId,
        userId: session.userId,
        tokenHash: hashToken(nextRefreshToken),
        expiresAt: expiresAt(nextRefreshToken),
      },
    });
  });

  return { accessToken: nextAccessToken, refreshToken: nextRefreshToken };
};

const getCurrentSession = async (auth) => {
  const member = await findActiveMember({
    id: auth.memberId,
    userId: auth.sub,
    orgId: auth.orgId,
  });

  if (!member || member.role !== auth.role) {
    throw new AppError(401, "Authentication required");
  }

  try {
    await assertSubscriptionActive(member.org.id);
  } catch (error) {
    if (error.subscriptionExpired) {
      await revokeAllSessions(member.user.id);
    }
    throw error;
  }

  return toSessionPayload(member);
};

const logout = async (rawRefreshToken, request) => {
  // The device seat is freed even when there is no usable refresh token, so
  // a client whose token already expired can still release the seat it holds
  // rather than stranding it until the row is manually cleared.
  if (request) {
    const device = readDeviceContext(request);
    let orgId = null;

    // The org comes from the refresh token when it is still readable; the
    // token is not trusted for anything beyond identifying which org's seat
    // to free, and the deviceId must match regardless.
    try {
      orgId = verifyRefreshToken(rawRefreshToken).orgId;
    } catch {
      orgId = null;
    }

    if (orgId) {
      await releaseDeviceSeat({ orgId, deviceId: device.deviceId });
    }
  }

  if (!rawRefreshToken) return;

  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawRefreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

// Kills every outstanding session for a user, not just the token presented on
// this request, so an expired subscription cannot be ridden out from another
// tab or device that still holds a valid refresh token.
const revokeAllSessions = async (userId) => {
  // Seats must be freed alongside the tokens, or an org whose plan lapsed
  // would stay at its device limit and be unable to sign back in after
  // renewing.
  await releaseAllUserSeats(userId);

  try {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Cookie clearing still happens; a stale token would fail its own
    // subscription check on the next request regardless.
  }
};

const findRecoveryMember = ({ email, orgSlug }) =>
  findActiveMember({ user: { email }, org: { slug: orgSlug, isActive: true } });

const createOtpCode = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

const sendPasswordOtpEmail = async ({ email, name, otp }) => {
  const mailConfig = getMailConfig();
  if (!mailConfig.host || !mailConfig.user || !mailConfig.pass || !mailConfig.from) {
    throw new AppError(503, "Email delivery is not configured. Please contact support.");
  }

  const { subject, text, html } = buildPasswordOtpEmail({
    name,
    otp,
    expiryMinutes: OTP_EXPIRY_MINUTES,
  });

  await getTransporter().sendMail({
    from: mailConfig.from,
    to: email,
    subject,
    text,
    html,
  });
};

const requestPasswordOtp = async ({ email, orgSlug }) => {
  const member = await findRecoveryMember({ email, orgSlug });
  if (!member) throw invalidRecoveryAccount();

  const otp = createOtpCode();
  const createdOtp = await prisma.$transaction(async (transaction) => {
    await transaction.otp.updateMany({
      where: { userId: member.user.id, purpose: "PASSWORD_RESET", used: "NOT_USED" },
      data: { used: "USED" },
    });

    return transaction.otp.create({
      data: {
        userId: member.user.id,
        otpHash: await hashPassword(otp),
        purpose: "PASSWORD_RESET",
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
        used: "NOT_USED",
      },
    });
  });

  try {
    await sendPasswordOtpEmail({ email: member.user.email, name: member.user.name, otp });
  } catch (error) {
    await prisma.otp.update({ where: { id: createdOtp.id }, data: { used: "USED" } }).catch(() => {});
    throw error;
  }
};

const getCurrentPasswordOtp = (userId) =>
  prisma.otp.findFirst({
    where: { userId, purpose: "PASSWORD_RESET", used: "NOT_USED" },
    orderBy: { createdAt: "desc" },
  });

const verifyPasswordOtp = async ({ email, orgSlug, otp }) => {
  const member = await findRecoveryMember({ email, orgSlug });
  if (!member) throw invalidRecoveryAccount();

  const storedOtp = await getCurrentPasswordOtp(member.user.id);
  if (!storedOtp || storedOtp.expiresAt <= new Date() || storedOtp.attempts >= OTP_MAX_ATTEMPTS) {
    throw invalidOtp();
  }

  const matches = await isPasswordValid(storedOtp.otpHash, otp);
  if (!matches) {
    const attempts = storedOtp.attempts + 1;
    await prisma.otp.update({
      where: { id: storedOtp.id },
      data: { attempts, ...(attempts >= OTP_MAX_ATTEMPTS ? { used: "USED" } : {}) },
    });
    throw invalidOtp();
  }

  await prisma.otp.update({ where: { id: storedOtp.id }, data: { verifiedAt: new Date() } });
};

const resetPasswordWithOtp = async ({ email, orgSlug, otp, newPassword }) => {
  const member = await findRecoveryMember({ email, orgSlug });
  if (!member) throw invalidRecoveryAccount();

  const storedOtp = await getCurrentPasswordOtp(member.user.id);
  if (!storedOtp || !storedOtp.verifiedAt || storedOtp.expiresAt <= new Date()) throw invalidOtp();

  const matches = await isPasswordValid(storedOtp.otpHash, otp);
  if (!matches) throw invalidOtp();

  const password = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: member.user.id }, data: { password, mustChangePassword: false } }),
    prisma.otp.update({ where: { id: storedOtp.id }, data: { used: "USED" } }),
    prisma.refreshToken.updateMany({ where: { userId: member.user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
};

module.exports = {
  login,
  refresh,
  getCurrentSession,
  logout,
  requestPasswordOtp,
  verifyPasswordOtp,
  resetPasswordWithOtp,
};
