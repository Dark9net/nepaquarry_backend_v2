const { AppError } = require("../lib/error");
const { getAccessToken } = require("../lib/authCookies");
const { verifyAccessToken } = require("../lib/tokens");

const authenticate = (request, response, next) => {
  const token = getAccessToken(request, response);

  if (!token) {
    next(new AppError(401, "Authentication required"));
    return;
  }

  try {
    request.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, "Authentication required"));
  }
};

module.exports = { authenticate };
