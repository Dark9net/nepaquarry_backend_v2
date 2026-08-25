const express = require("express");
const rateLimit = require("express-rate-limit");

const { authenticate } = require("../middleware/authenticate");
const controller = require("../controllers/subscription.controller");
const { validateBillingDetails, validateCheckout } = require("../validator/subscription.validator");

const router = express.Router();

const rateLimitResponse = (message) => (request, response) => {
  const resetTime = request.rateLimit?.resetTime;
  const retryAfterSeconds = resetTime
    ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
    : undefined;

  if (retryAfterSeconds) {
    response.set("Retry-After", String(retryAfterSeconds));
  }

  response.status(429).json({ message, retryAfterSeconds });
};

// This is a public, unauthenticated storefront (there is no session yet
// during checkout), so it is rate limited the same way auth.routes.js limits
// login: generously for browsing plans, tightly for the write endpoint that
// actually creates billing records.
const plansLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitResponse("Too many requests. Please try again later."),
});

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitResponse("Too many checkout attempts. Please try again later."),
});

router.get("/subscriptions/plans", plansLimiter, controller.listPlans);
router.post("/subscriptions/billing-details", checkoutLimiter, validateBillingDetails, controller.validateBillingDetails);
router.post("/subscriptions/checkout", checkoutLimiter, validateCheckout, controller.checkout);

// Only this route needs a signed-in workspace member (it reads the caller's
// own org from the access token), so `authenticate` is scoped to just this
// path instead of the whole router.
router.get("/subscriptions/current", authenticate, controller.getCurrentSubscription);

module.exports = router;
