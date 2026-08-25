const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const planSelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  price: true,
  currency: true,
  membercount: true,
  packagestatus: true,
  billingInterval: true,
  trialDays: true,
};

const serializePlan = (plan) => ({
  ...plan,
  price: Number(plan.price),
});

// Only plans marked active are meant for the public storefront; anything
// disabled in the admin console should disappear from checkout immediately.
const listActivePlans = async () => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    select: planSelect,
    orderBy: [{ price: "asc" }],
  });

  return plans.map(serializePlan);
};

const findActivePlanById = async (planId) => {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { id: planId, isActive: true },
    select: planSelect,
  });

  if (!plan) {
    throw new AppError(404, "The selected plan is no longer available.");
  }

  return serializePlan(plan);
};

/*
 * Confirms the billing pair actually belongs together: the organization must
 * exist (and be active), and the email must belong to one of that org's own
 * active members.
 *
 * Both halves deliberately fail with the SAME message. Saying which half was
 * wrong would turn this endpoint into an oracle for probing which
 * organizations exist and who belongs to them, and it is unauthenticated.
 */
const MISMATCH_MESSAGE =
  "The organization name and email do not match our records. Check both and try again.";

// Organization.name has no unique constraint (only `slug` does), so a name
// can in principle match more than one row. Rather than silently charging
// whichever one sorts first, an ambiguous name is rejected and the caller is
// asked to contact billing. `findMany` with take: 2 is enough to detect the
// collision without loading every namesake.
//
// The comparison is a plain equality: the column is utf8mb4_unicode_ci, so
// MySQL already matches it case-insensitively and "MPIS" finds "mpis".
const verifyOrgAndEmail = async (orgName, email) => {
  const matches = await prisma.organization.findMany({
    where: { name: orgName },
    select: { id: true, name: true, slug: true, isActive: true },
    take: 2,
  });

  if (matches.length > 1) {
    throw new AppError(
      409,
      "More than one organization uses that name. Contact billing@nepaquarry.com to complete this purchase.",
    );
  }

  const organization = matches[0];

  if (!organization) {
    throw new AppError(404, MISMATCH_MESSAGE);
  }

  if (!organization.isActive) {
    throw new AppError(403, "This organization's access is currently paused. Contact billing@nepaquarry.com.");
  }

  // Emails are stored lowercase; the validator already lowercases the input.
  const member = await prisma.organizationMember.findFirst({
    where: {
      orgId: organization.id,
      isActive: true,
      user: { is: { email } },
    },
    select: { id: true },
  });

  if (!member) {
    throw new AppError(404, MISMATCH_MESSAGE);
  }

  return organization;
};

// The checkout form is filled out before anyone signs in, so there is no
// authenticated user to attribute the purchase to. The organization's own
// admin is used as the subscriber of record, with a decreasing preference so
// there is always someone to attribute it to as long as the org has members.
const findSubscribingMember = async (orgId) => {
  const member =
    (await prisma.organizationMember.findFirst({
      where: { orgId, role: "ADMIN", isActive: true },
      select: { userId: true },
      orderBy: { id: "asc" },
    })) ||
    (await prisma.organizationMember.findFirst({
      where: { orgId, isActive: true },
      select: { userId: true },
      orderBy: { id: "asc" },
    }));

  if (!member) {
    throw new AppError(409, "This organization has no active members to record the subscription against.");
  }

  return member.userId;
};

const BILLING_MONTHS = {
  MONTHLY: 1,
  QUARTERLY: 3,
  HALF_YEARLY: 6,
  YEARLY: 12,
};

const addMonths = (date, months) => {
  const next = new Date(date);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  return next;
};

/*
 * Records a completed checkout: resolves the organization from its slug,
 * verifies the plan is still purchasable, then creates a Subscription and
 * its first SubscriptionPayment in one transaction so a partial write can
 * never leave a payment without a subscription (or vice versa).
 *
 * The organization keeps exactly ONE subscription row: any earlier rows for
 * the same organization are removed as part of the same transaction, so a
 * renewal replaces the previous record rather than stacking beside it.
 *
 * Payment history is deliberately preserved. SubscriptionPayment.subscription
 * is `onDelete: Restrict`, and those rows feed the Billing entries in the user
 * activity log, so old payments are re-pointed at the new subscription before
 * the old rows are deleted instead of being deleted with them.
 */
const checkout = async (input) => {
  const organization = await verifyOrgAndEmail(input.orgName, input.email);
  const plan = await findActivePlanById(input.planId);
  const subscribedByUserId = await findSubscribingMember(organization.id);

  const months = BILLING_MONTHS[plan.billingInterval] || 1;
  const now = new Date();
  const subscriptionEndsAt = addMonths(now, months);

  const contactNote = [
    input.contactName ? `Contact: ${input.contactName}` : null,
    input.phone ? `Phone: ${input.phone}` : null,
  ].filter(Boolean).join(" | ") || null;

  const result = await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.create({
      data: {
        organizationId: organization.id,
        planId: plan.id,
        subscribedByUserId,
        // Checkout records an *intent* to pay, not a settled payment: none of
        // the providers here are integrated, so nothing has actually cleared
        // when this row is written. It starts UNPAID and is promoted to ACTIVE
        // once the payment is confirmed out of band. Sign-in is gated on
        // ACTIVE (auth.service.js), so an unpaid org cannot get in.
        status: "UNPAID",
        unitPrice: plan.price,
        currency: plan.currency,
        billingInterval: plan.billingInterval,
        SubscriptionStartsAt: now,
        SubscriptionEndsAt: subscriptionEndsAt,
        nextBillingAt: subscriptionEndsAt,
        autoRenew: false,
        provider: input.provider,
      },
    });

    // Scoped to this organization only — other organizations' rows are
    // never touched.
    const supersededIds = (
      await tx.subscription.findMany({
        where: { organizationId: organization.id, id: { not: subscription.id } },
        select: { id: true },
      })
    ).map((row) => row.id);

    if (supersededIds.length) {
      // Re-point first: the FK is Restrict, so a delete would fail while any
      // payment still references the old subscription.
      await tx.subscriptionPayment.updateMany({
        where: { subscriptionId: { in: supersededIds } },
        data: { subscriptionId: subscription.id },
      });

      await tx.subscription.deleteMany({
        where: { id: { in: supersededIds }, organizationId: organization.id },
      });
    }

    const payment = await tx.subscriptionPayment.create({
      data: {
        organizationId: organization.id,
        subscriptionId: subscription.id,
        provider: input.provider,
        // Mirrors the subscription above: the money has not been confirmed
        // received, so the payment row is PENDING rather than PAID.
        status: "PENDING",
        amount: input.amount,
        currency: plan.currency,
        transactionId: input.reference,
        paymentMethodLabel: input.paymentMethodLabel,
        // Not paid yet, so there is no payment timestamp to record.
        paidAt: null,
        notes: contactNote,
      },
    });

    return { subscription, payment, supersededCount: supersededIds.length };
  });

  return {
    subscriptionId: result.subscription.id,
    paymentId: result.payment.id,
    organization: { id: organization.id, name: organization.name, slug: organization.slug },
    plan,
    status: result.payment.status,
    paidAt: result.payment.paidAt,
  };
};

// Used by the workspace footer to show days left on the plan; picks the most
// recently started subscription regardless of status so an expired org still
// sees an (overdue) expiry date instead of nothing.
const getCurrentSubscription = async (orgId) => {
  const subscription = await prisma.subscription.findFirst({
    where: { organizationId: orgId },
    select: {
      status: true,
      SubscriptionEndsAt: true,
      plan: { select: { name: true, code: true } },
    },
    orderBy: { SubscriptionStartsAt: "desc" },
  });

  if (!subscription) return null;

  const endsAt = subscription.SubscriptionEndsAt;
  const daysRemaining = endsAt
    ? Math.ceil((endsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  return {
    status: subscription.status,
    planName: subscription.plan.name,
    planCode: subscription.plan.code,
    subscriptionEndsAt: endsAt,
    daysRemaining,
  };
};

module.exports = {
  listActivePlans,
  findActivePlanById,
  verifyOrgAndEmail,
  checkout,
  getCurrentSubscription,
};
