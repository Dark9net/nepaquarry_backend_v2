const prisma = require("../config/db");
const { AppError } = require("../lib/error");

// Raised when an org has no free device seats left. Flagged so the auth
// controller can surface it distinctly from an ordinary 403 — the client
// shows a "log out from the other device" prompt rather than a generic
// permission error.
const deviceLimitReached = (limit, activeSessions) => {
  const error = new AppError(
    403,
    limit === 1
      ? "Someone from your organization is already signed in on another device. Please log out there before signing in here."
      : `Your plan allows ${limit} devices to be signed in at once, and all ${limit} are in use. Please log out from another device before signing in here.`,
  );
  error.deviceLimitReached = true;
  error.deviceLimit = limit;
  // Lets the client render *which* devices are holding the seats so the user
  // knows where to go and sign out. No tokens or hashes are exposed here.
  error.activeSessions = activeSessions;
  return error;
};

// The most recently started subscription is the org's current plan — the
// same rule used by assertSubscriptionActive and getCurrentSubscription, so
// all three agree on which subscription is in force.
//
// Returns null when the org has no subscription row at all. That case is
// deliberately left uncapped by the caller: orgs predating the checkout
// feature have no plan, and capping them at zero devices would lock out
// every pre-existing organization.
const getSeatLimit = async (orgId) => {
  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: orgId },
    select: { plan: { select: { membercount: true } } },
    orderBy: { SubscriptionStartsAt: "desc" },
  });

  if (!subscription) return null;

  const limit = subscription.plan?.membercount;

  // membercount defaults to 0 in the schema. Treating 0 as "no devices
  // allowed" would make a misconfigured plan lock an org out entirely, so
  // it is read as "unlimited" instead — the safer failure direction.
  return Number.isInteger(limit) && limit > 0 ? limit : null;
};

const activeSessionSummary = (session) => ({
  deviceId: session.deviceId,
  deviceType: session.deviceType,
  deviceLabel: session.deviceLabel,
  lastActiveAt: session.lastActiveAt,
  userName: session.user?.name ?? null,
});

/**
 * Claims a device seat for `userId` in `orgId`, enforcing the plan's
 * membercount. Must be called inside a transaction so the seat count and the
 * insert cannot interleave with a competing login.
 *
 * Re-login from a device that already holds a seat reuses that row instead of
 * consuming another, so refreshing the browser or signing in again on the
 * same machine never costs an extra seat.
 */
const claimDeviceSeat = async (transaction, { orgId, userId, device }) => {
  const limit = await getSeatLimit(orgId);

  const existing = await transaction.userSession.findUnique({
    where: { orgId_deviceId: { orgId, deviceId: device.deviceId } },
  });

  // This device already holds a seat (possibly for a different user in the
  // same org, or a previously revoked session). Reclaiming it is not a new
  // seat, so it bypasses the cap entirely.
  if (existing) {
    return transaction.userSession.update({
      where: { id: existing.id },
      data: {
        userId,
        deviceType: device.deviceType,
        deviceLabel: device.deviceLabel,
        ipAddress: device.ipAddress,
        userAgent: device.userAgent,
        revokedAt: null,
        lastActiveAt: new Date(),
      },
    });
  }

  if (limit !== null) {
    const activeSessions = await transaction.userSession.findMany({
      where: { orgId, revokedAt: null },
      select: {
        deviceId: true,
        deviceType: true,
        deviceLabel: true,
        lastActiveAt: true,
        user: { select: { name: true } },
      },
      orderBy: { lastActiveAt: "desc" },
    });

    if (activeSessions.length >= limit) {
      throw deviceLimitReached(limit, activeSessions.map(activeSessionSummary));
    }
  }

  return transaction.userSession.create({
    data: {
      orgId,
      userId,
      deviceId: device.deviceId,
      deviceType: device.deviceType,
      deviceLabel: device.deviceLabel,
      ipAddress: device.ipAddress,
      userAgent: device.userAgent,
    },
  });
};

// Frees the seat held by one device. Revoking rather than deleting keeps the
// row as history; the unique constraint lets a later login reclaim it.
const releaseDeviceSeat = async ({ orgId, deviceId }) => {
  if (!orgId || !deviceId) return;

  await prisma.userSession.updateMany({
    where: { orgId, deviceId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

// Frees every seat a user holds across all their devices. Used when the
// subscription lapses, which already revokes all their refresh tokens.
const releaseAllUserSeats = async (userId) => {
  if (!userId) return;

  try {
    await prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Seat bookkeeping must never block the session teardown it accompanies.
  }
};

// Keeps `lastActiveAt` current so the "which devices are signed in" list
// shown on a seat rejection is meaningful. Best-effort: a failure here must
// not break an otherwise valid token refresh.
const touchDeviceSeat = async ({ orgId, deviceId }) => {
  if (!orgId || !deviceId) return;

  try {
    await prisma.userSession.updateMany({
      where: { orgId, deviceId, revokedAt: null },
      data: { lastActiveAt: new Date() },
    });
  } catch {
    // Non-critical bookkeeping.
  }
};

const listActiveSessions = async (orgId) => {
  const sessions = await prisma.userSession.findMany({
    where: { orgId, revokedAt: null },
    select: {
      deviceId: true,
      deviceType: true,
      deviceLabel: true,
      lastActiveAt: true,
      user: { select: { name: true } },
    },
    orderBy: { lastActiveAt: "desc" },
  });

  return sessions.map(activeSessionSummary);
};

module.exports = {
  getSeatLimit,
  claimDeviceSeat,
  releaseDeviceSeat,
  releaseAllUserSeats,
  touchDeviceSeat,
  listActiveSessions,
};
