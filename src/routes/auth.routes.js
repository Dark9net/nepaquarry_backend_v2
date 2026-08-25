const express = require("express");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = rateLimit;


const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/authenticate");
const {
  validateLogin,
  validatePasswordOtpRequest,
  validatePasswordOtpVerification,
  validatePasswordReset,
} = require("../validator/auth.validator");

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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  // Successful sign-ins should not consume the failed-attempt allowance.
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitResponse("Too many login attempts. Please try again later."),
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitResponse("Too many session refresh attempts. Please try again later."),
});

// Sending an OTP costs a real email, so requests are capped tightly and keyed
// per account as well as per IP — otherwise one shared office IP could lock
// out every colleague, and a single address could be mail-bombed from many IPs.
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (request) => {
    const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
    const org = typeof request.body?.orgSlug === "string" ? request.body.orgSlug.trim().toLowerCase() : "";
    // `ipKeyGenerator` normalizes IPv6 into a subnet, which is what the
    // library expects any custom key to be built on.
    return `${ipKeyGenerator(request.ip)}:${org}:${email}`;
  },
  handler: rateLimitResponse(
    "Too many verification codes requested. Please wait before asking for another.",
  ),
});

// Verifying and resetting do not send mail, so they get a separate, larger
// budget: a user fumbling a six-digit code should not be blocked from
// finishing by the cost of having requested it.
const passwordRecoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  // A correct code should not consume the allowance meant for guesses.
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitResponse("Too many password recovery attempts. Please try again later."),
});

router.post("/login", loginLimiter, validateLogin, authController.login);
router.post("/refresh", refreshLimiter, authController.refresh);
router.get("/me", authenticate, authController.me);
router.post("/logout", authController.logout);
router.post("/password/otp/request", otpRequestLimiter, validatePasswordOtpRequest, authController.requestPasswordOtp);
router.post("/password/otp/verify", passwordRecoveryLimiter, validatePasswordOtpVerification, authController.verifyPasswordOtp);
router.post("/password/reset", passwordRecoveryLimiter, validatePasswordReset, authController.resetPasswordWithOtp);

module.exports = router;
