const bcrypt = require("bcrypt");

// All password and OTP hashes are bcrypt at this cost. The cost is encoded in
// the hash itself, so raising it later only affects newly written hashes and
// existing ones keep verifying.
const SALT_ROUNDS = 12;

// bcrypt silently truncates input at 72 bytes, so a longer password would be
// accepted at signup and then match on only its first 72 bytes. Reject instead
// of quietly weakening the check.
const MAX_PASSWORD_BYTES = 72;

const assertHashable = (plaintext) => {
  if (Buffer.byteLength(plaintext, "utf8") > MAX_PASSWORD_BYTES) {
    throw new Error(`Password must be at most ${MAX_PASSWORD_BYTES} bytes`);
  }
};

const hashPassword = async (plaintext) => {
  assertHashable(plaintext);
  return bcrypt.hash(plaintext, SALT_ROUNDS);
};

const verifyPassword = async (hash, plaintext) => {
  if (!hash || typeof plaintext !== "string") return { valid: false };

  // An over-long password can never have produced a stored hash here, and
  // bcrypt.compare would otherwise compare only the first 72 bytes.
  if (Buffer.byteLength(plaintext, "utf8") > MAX_PASSWORD_BYTES) {
    return { valid: false };
  }

  const valid = await bcrypt.compare(plaintext, hash).catch(() => false);
  return { valid };
};

// Convenience wrapper for call sites that only need a boolean.
const isPasswordValid = async (hash, plaintext) => (await verifyPassword(hash, plaintext)).valid;

module.exports = {
  SALT_ROUNDS,
  MAX_PASSWORD_BYTES,
  hashPassword,
  verifyPassword,
  isPasswordValid,
};
