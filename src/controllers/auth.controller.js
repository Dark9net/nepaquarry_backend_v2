const authService = require("../services/auth.service");
const {
  setAuthCookies,
  getRefreshToken,
  clearAuthCookies,
} = require("../lib/authCookies");

const login = async (request, response, next) => {
  try {
    const { tokens, session } = await authService.login(request.body, request);
    setAuthCookies(request, response, tokens);
    response.status(200).json({ data: session });
  } catch (error) {
    // A rejected sign-in must never leave usable auth cookies behind.
    clearAuthCookies(request, response);
    next(error);
  }
};

const refresh = async (request, response, next) => {
  try {
    const tokens = await authService.refresh(getRefreshToken(request, response), request);
    setAuthCookies(request, response, tokens);
    response.status(204).end();
  } catch (error) {
    clearAuthCookies(request, response);
    next(error);
  }
};

const me = async (request, response, next) => {
  try {
    const session = await authService.getCurrentSession(request.auth);
    response.status(200).json({ data: session });
  } catch (error) {
    // An expired subscription ends the session outright: the refresh tokens
    // are already revoked in the service, so the browser's auth cookies must
    // go too. Otherwise renewing the plan would let the surviving cookie sign
    // the user straight back in without re-entering credentials.
    if (error.subscriptionExpired) {
      clearAuthCookies(request, response);
    }
    next(error);
  }
};

const logout = async (request, response, next) => {
  try {
    await authService.logout(getRefreshToken(request, response), request);
    clearAuthCookies(request, response);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
};

const requestPasswordOtp = async (request, response, next) => {
  try {
    await authService.requestPasswordOtp(request.body);
    response.status(200).json({ message: "A verification code has been sent to your email address." });
  } catch (error) {
    next(error);
  }
};

const verifyPasswordOtp = async (request, response, next) => {
  try {
    await authService.verifyPasswordOtp(request.body);
    response.status(200).json({ message: "Verification code confirmed." });
  } catch (error) {
    next(error);
  }
};

const resetPasswordWithOtp = async (request, response, next) => {
  try {
    await authService.resetPasswordWithOtp(request.body);
    response.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refresh,
  me,
  logout,
  requestPasswordOtp,
  verifyPasswordOtp,
  resetPasswordWithOtp,
};
