const crypto = require("crypto");

const DEVICE_ID_HEADER = "x-device-id";
const DEVICE_TYPE_HEADER = "x-device-type";
const DEVICE_LABEL_HEADER = "x-device-label";

const DEVICE_TYPES = new Set(["WEB", "ANDROID", "IOS", "DESKTOP", "OTHER"]);

// Clients send a stable per-install id so that repeated logins from the same
// browser reuse one device seat. A client that sends nothing must still be
// able to sign in, so fall back to a fingerprint of the properties that stay
// constant for a given browser on a given network. This is weaker than a real
// device id (two identical browsers behind one NAT collide, which under-counts
// rather than locks anyone out) but it keeps older clients working.
const derivedDeviceId = (request) =>
  crypto
    .createHash("sha256")
    .update(`${request.ip || ""}|${request.get("user-agent") || ""}`)
    .digest("hex")
    .slice(0, 32);

const readDeviceType = (raw) => {
  const value = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  return DEVICE_TYPES.has(value) ? value : "WEB";
};

const readDeviceContext = (request) => {
  const supplied = request.get(DEVICE_ID_HEADER);
  const deviceId =
    typeof supplied === "string" && supplied.trim()
      ? supplied.trim().slice(0, 128)
      : derivedDeviceId(request);

  return {
    deviceId,
    deviceType: readDeviceType(request.get(DEVICE_TYPE_HEADER)),
    deviceLabel: request.get(DEVICE_LABEL_HEADER)?.slice(0, 191) || null,
    ipAddress: request.ip || null,
    userAgent: request.get("user-agent")?.slice(0, 512) || null,
  };
};

module.exports = {
  readDeviceContext,
  DEVICE_ID_HEADER,
  DEVICE_TYPE_HEADER,
  DEVICE_LABEL_HEADER,
};
