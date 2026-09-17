const crypto = require("crypto");
const Cookies = require("cookies");
const Keygrip = require("keygrip");

const { env } = require("../config/env");

const ACCESS_COOKIE = "nq_access";
const REFRESH_COOKIE = "nq_refresh";
const isProduction = env.NODE_ENV === "production";

// Keep cookie signing keys separate from the JWT signing keys.
const deriveKey = (purpose) =>
  crypto
    .createHash("sha256")
    .update(`${env.COOKIE_SECRET}:${purpose}`)
    .digest("hex");

const cookieKeys = new Keygrip([deriveKey("signature")], "sha384", "base64");
// cPanel terminates TLS at Apache/LiteSpeed before proxying to this Node
// process. In production the browser connection is HTTPS even when Node sees
// the upstream socket as HTTP, so tell `cookies` to retain the Secure flag.
const cookieJar = (request, response) => new Cookies(request, response, {
  keys: cookieKeys,
  secure: isProduction,
});

const commonOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  priority: "high",
  path: "/",
  overwrite: true,
};

const durationToMilliseconds = (value, fallback) => {
  const match = /^(\d+)\s*([smhd])$/i.exec(value || "");
  if (!match) return fallback;

  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(match[1]) * units[match[2].toLowerCase()];
};

const setAuthCookies = (request, response, { accessToken, refreshToken }) => {
  const cookies = cookieJar(request, response);

  cookies.set(ACCESS_COOKIE, accessToken, {
    ...commonOptions,
    maxAge: durationToMilliseconds(env.JWT.ACCESS_EXPIRES_IN, 15 * 60_000),
  });
  cookies.set(REFRESH_COOKIE, refreshToken, {
    ...commonOptions,
    maxAge: durationToMilliseconds(env.JWT.REFRESH_EXPIRES_IN, 30 * 86_400_000),
  });
};

const getAccessToken = (request, response) => {
  try {
    return cookieJar(request, response).get(ACCESS_COOKIE, { signed: true });
  } catch {
    return null;
  }
};

const getRefreshToken = (request, response) => {
  try {
    return cookieJar(request, response).get(REFRESH_COOKIE, { signed: true });
  } catch {
    return null;
  }
};

const clearAuthCookies = (request, response) => {
  const cookies = cookieJar(request, response);
  const expiredOptions = { ...commonOptions, signed: false };

  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    cookies.set(name, null, expiredOptions);
    cookies.set(`${name}.sig`, null, expiredOptions);
  }
};

module.exports = {
  setAuthCookies,
  getAccessToken,
  getRefreshToken,
  clearAuthCookies,
};
