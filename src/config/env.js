const dotenv = require("dotenv");

dotenv.config();

const required = (name, value) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

// Number of reverse proxies in front of the app.
//
// Being behind a proxy is a property of the deployment, not of NODE_ENV, so
// it gets its own setting. When TRUST_PROXY is unset this auto-detects the
// cPanel/Passenger case: Passenger always fronts the app with Apache or
// LiteSpeed (which is what sets X-Forwarded-For) and exports these markers
// into the process environment. Detecting it means a cPanel deploy works
// without anyone remembering to add an environment variable in the UI --
// forgetting it leaves express-rate-limit keying every request on the
// proxy's own IP, so one noisy client rate-limits the entire site.
//
// Explicit TRUST_PROXY always wins, including "0" to force it off.
const detectTrustProxy = () => {
  const explicit = process.env.TRUST_PROXY?.trim();

  if (explicit) {
    const parsed = Number(explicit);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  const behindPassenger = Boolean(
    process.env.PASSENGER_BASE_URI ||
      process.env.PASSENGER_APP_ENV ||
      process.env.PASSENGER_SPAWN_METHOD ||
      process.env.IN_PASSENGER,
  );

  return behindPassenger ? 1 : 0;
};

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  TRUST_PROXY: detectTrustProxy(),
  PORT: Number(process.env.BACKEND_PORT || 4001),
  FRONTEND_URL: required("FRONTEND_URL", process.env.FRONTEND_URL),
  // Direct MySQL connection used by the driver adapter and by migrations.
  DATABASE_URL: required("DATABASE_URL", process.env.DATABASE_URL),
  JWT: {
    ACCESS_SECRET: required("JWT_SECRET", process.env.JWT_SECRET),
    REFRESH_SECRET: required("JWT_REFRESH_TOKEN", process.env.JWT_REFRESH_TOKEN),
    ACCESS_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30m",
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  COOKIE_SECRET:
    process.env.COOKIE_SECRET?.trim() ||
    required("JWT_REFRESH_TOKEN", process.env.JWT_REFRESH_TOKEN),
  MAIL: {
    SERVER:
      process.env.SMTP_HOST?.trim() ||
      null,
    PORT: Number(
      process.env.SMTP_PORT?.trim() ||
        465,
    ),
    SECURE:
      (process.env.SMTP_SECURE?.trim() || "").toLowerCase() === "true"
        ? true
        : Number(
            process.env.SMTP_PORT?.trim() ||
              465,
          ) === 465,
    USERNAME:
      process.env.SMTP_USER?.trim() ||
      null,
    PASSWORD:
      process.env.SMTP_PASS?.trim() ||
      null,
    FROM:
      process.env.SMTP_FROM?.trim() ||
      null,
  },
};

module.exports = {
  env,
};
