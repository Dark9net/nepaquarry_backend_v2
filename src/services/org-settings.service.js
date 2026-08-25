const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const notFound = () => new AppError(404, "Organization not found");

const getOrgSettings = async (orgId) => {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true, advanceRequestLimit: true, additionalAdvanceLimit: true },
  });
  if (!org) throw notFound();
  return org;
};

const updateOrgSettings = async (orgId, data) => {
  const org = await prisma.organization.update({
    where: { id: orgId },
    data: {
      advanceRequestLimit: data.advanceRequestLimit,
      additionalAdvanceLimit: data.additionalAdvanceLimit,
    },
    select: { id: true, name: true, advanceRequestLimit: true, additionalAdvanceLimit: true },
  });
  return org;
};

const dayRange = (from, to) => {
  const range = {};
  if (from) range.gte = new Date(`${from}T00:00:00.000Z`);
  if (to) range.lte = new Date(`${to}T23:59:59.999Z`);
  return Object.keys(range).length ? range : undefined;
};

const otpPurposeLabel = {
  EMAIL_VERIFICATION: "Email verification",
  PASSWORD_RESET: "Password reset",
  PHONE_VERIFICATION: "Phone verification",
  LOGIN_VERIFICATION: "Login verification",
};

const actorFromMember = (member) =>
  member
    ? { memberId: member.id, name: member.user.name, email: member.user.email, role: member.role }
    : null;

const memberSelect = {
  id: true,
  role: true,
  user: { select: { name: true, email: true } },
};

const findMemberForUser = async (orgId, userId) => {
  if (!userId) return null;
  return prisma.organizationMember.findFirst({
    where: { orgId, userId },
    select: memberSelect,
  });
};

const otpToLog = (otp, member) => ({
  id: `otp:${otp.id}`,
  action: otp.used === "USED" ? "OTP_VERIFIED" : "OTP_ISSUED",
  module: "Authentication",
  entityType: "Otp",
  entityId: otp.id,
  description: `${otpPurposeLabel[otp.purpose] || otp.purpose} OTP ${otp.used === "USED" ? "verified" : "issued"}`,
  metadata: { purpose: otp.purpose, attempts: otp.attempts, email: otp.user?.email },
  ipAddress: null,
  userAgent: null,
  createdAt: otp.createdAt,
  actor: actorFromMember(member),
});

const loginAttemptToLog = (attempt, member) => ({
  id: `login:${attempt.id}`,
  action: `LOGIN_${attempt.status}`,
  module: "Authentication",
  entityType: "LoginAttempt",
  entityId: attempt.id,
  description:
    attempt.status === "SUCCESS"
      ? "Successful login"
      : attempt.status === "BLOCKED"
        ? "Login blocked"
        : "Failed login attempt",
  metadata: { email: attempt.user?.email },
  ipAddress: attempt.ipAddress,
  userAgent: attempt.userAgent,
  createdAt: attempt.createdAt,
  actor: actorFromMember(member),
});

const paymentToLog = (payment, member) => ({
  id: `payment:${payment.id}`,
  action: `PAYMENT_${payment.status}`,
  module: "Billing",
  entityType: "SubscriptionPayment",
  entityId: payment.id,
  description: `${payment.provider} payment of ${payment.currency} ${payment.amount} ${payment.status.toLowerCase()}`,
  metadata: { provider: payment.provider, amount: payment.amount, currency: payment.currency, invoiceId: payment.invoiceId },
  ipAddress: null,
  userAgent: null,
  createdAt: payment.createdAt,
  actor: actorFromMember(member),
});

const listUserActivityLogs = async (orgId, filters, pagination) => {
  const createdAt = dayRange(filters.from, filters.to);

  const orgUserFilter = { memberships: { some: { orgId } } };

  const [otps, loginAttempts, payments] = await Promise.all([
    prisma.otp.findMany({
      where: { ...(createdAt ? { createdAt } : {}), user: orgUserFilter },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.loginAttempt.findMany({
      where: { ...(createdAt ? { createdAt } : {}), user: orgUserFilter },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscriptionPayment.findMany({
      where: { ...(createdAt ? { createdAt } : {}), organizationId: orgId },
      include: { recordedBy: { select: { id: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const userIds = new Set();
  otps.forEach((o) => userIds.add(o.user.id));
  loginAttempts.forEach((a) => a.user && userIds.add(a.user.id));
  payments.forEach((p) => p.recordedBy && userIds.add(p.recordedBy.id));

  const members = await prisma.organizationMember.findMany({
    where: { orgId, userId: { in: Array.from(userIds) } },
    select: { ...memberSelect, userId: true },
  });
  const memberByUserId = new Map(members.map((m) => [m.userId, m]));

  const entries = [
    ...otps.map((o) => otpToLog(o, memberByUserId.get(o.user.id))),
    ...loginAttempts.map((a) => loginAttemptToLog(a, a.user ? memberByUserId.get(a.user.id) : null)),
    ...payments.map((p) => paymentToLog(p, p.recordedBy ? memberByUserId.get(p.recordedBy.id) : null)),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = entries.length;
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? (total || 1);
  const start = (page - 1) * limit;
  const data = pagination ? entries.slice(start, start + limit) : entries;

  return {
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

module.exports = { getOrgSettings, updateOrgSettings, listUserActivityLogs };
