const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { env } = require("../config/env");

const ACCESS_TOKEN_TYPE = "access";
const REFRESH_TOKEN_TYPE = "refresh";

const createAccessToken = (session) =>
  jwt.sign(
    {
      type: ACCESS_TOKEN_TYPE,
      memberId: session.memberId,
      orgId: session.orgId,
      role: session.role,
      sid: session.sessionId,
    },
    env.JWT.ACCESS_SECRET,
    {
      subject: session.userId,
      expiresIn: env.JWT.ACCESS_EXPIRES_IN,
      issuer: "nepaquarry-api",
      audience: "nepaquarry-web",
    },
  );

const createRefreshToken = (session) =>
  jwt.sign(
    {
      type: REFRESH_TOKEN_TYPE,
      memberId: session.memberId,
      orgId: session.orgId,
      role: session.role,
      sid: session.sessionId,
      jti: crypto.randomUUID(),
    },
    env.JWT.REFRESH_SECRET,
    {
      subject: session.userId,
      expiresIn: env.JWT.REFRESH_EXPIRES_IN,
      issuer: "nepaquarry-api",
      audience: "nepaquarry-web",
    },
  );

const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, env.JWT.ACCESS_SECRET, {
    issuer: "nepaquarry-api",
    audience: "nepaquarry-web",
  });

  if (
    payload.type !== ACCESS_TOKEN_TYPE ||
    !payload.sub ||
    !payload.memberId ||
    !payload.sid
  ) {
    throw new jwt.JsonWebTokenError("Invalid access token");
  }

  return payload;
};

const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, env.JWT.REFRESH_SECRET, {
    issuer: "nepaquarry-api",
    audience: "nepaquarry-web",
  });

  if (
    payload.type !== REFRESH_TOKEN_TYPE ||
    !payload.sub ||
    !payload.memberId ||
    !payload.sid
  ) {
    throw new jwt.JsonWebTokenError("Invalid refresh token");
  }

  return payload;
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const expiresAt = (token) => {
  const decoded = jwt.decode(token);

  if (!decoded?.exp) {
    throw new Error("Refresh token has no expiration");
  }

  return new Date(decoded.exp * 1000);
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  expiresAt,
};
