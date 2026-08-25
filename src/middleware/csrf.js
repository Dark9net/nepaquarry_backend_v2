const { AppError } = require("../lib/error");
const { env } = require("../config/env");

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const allowedOrigin = normalizeOrigin(env.FRONTEND_URL);
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// SameSite cookies block cross-site cookie delivery; this origin check adds a
// server-side CSRF barrier for every mutating browser request.
const verifyTrustedOrigin = (request, _response, next) => {
  if (!unsafeMethods.has(request.method)) {
    next();
    return;
  }

  const origin = normalizeOrigin(request.get("origin"));

  if (!origin || origin !== allowedOrigin) {
    next(new AppError(403, "Request origin is not allowed"));
    return;
  }

  next();
};

module.exports = { verifyTrustedOrigin };
