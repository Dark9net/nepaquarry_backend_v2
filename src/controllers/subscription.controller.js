const subscriptionService = require("../services/subscription.service");

const respond = (handler, status = 200) => async (request, response, next) => {
  try {
    const result = await handler(request);
    response.status(status).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const listPlans = respond(() => subscriptionService.listActivePlans());

// The billing-details step verifies the organization ID and email actually
// belong together, and resolves the plan, before the user is allowed on to
// the confirmation page. Nothing is written to the database here — that
// still happens only when the user presses Pay.
const validateBillingDetails = respond(async (request) => {
  // Sequential rather than concurrent so the surfaced error is deterministic:
  // a stale plan is reported before the org/email pair is judged.
  const plan = await subscriptionService.findActivePlanById(request.body.planId);
  const organization = await subscriptionService.verifyOrgAndEmail(
    request.body.orgName,
    request.body.email,
  );

  return {
    // Both are echoed back from the resolved record rather than from the
    // input: `orgName` is the canonically-cased stored name (the user may
    // have typed "mpis"), and `orgSlug` is returned so the confirmation step
    // has the org's real identifier without re-resolving the name.
    orgSlug: organization.slug,
    orgName: organization.name,
    contactName: request.body.contactName,
    email: request.body.email,
    phone: request.body.phone,
    provider: request.body.provider,
    plan,
  };
});

const checkout = respond((request) => subscriptionService.checkout(request.body), 201);

const getCurrentSubscription = respond((request) =>
  subscriptionService.getCurrentSubscription(request.auth.orgId));

module.exports = { listPlans, validateBillingDetails, checkout, getCurrentSubscription };
