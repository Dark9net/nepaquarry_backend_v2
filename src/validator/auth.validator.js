const { z } = require("zod");

// Sign-in identifies the organization by its display NAME, not its slug.
// Names are free text — spaces, capitals, "&", "." are all legitimate — so
// the slug's [a-zA-Z0-9-] rule must not be applied here; it would reject a
// real name like "MPIS Pvt. Ltd.". Case is preserved rather than lowercased,
// because Organization.name is utf8mb4_unicode_ci and MySQL already matches
// it case-insensitively. The bound matches the column's storage.
//
// Password recovery below still identifies the org by slug; only the login
// form was changed.
const orgNameField = z
  .string({ message: "Organization name is required" })
  .trim()
  .min(2, "Organization name must be at least 2 characters")
  .max(191, "Organization name must be 191 characters or less");

const loginSchema = z
  .object({
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(256),
    orgName: orgNameField,
  })
  .strict();

const recoveryIdentitySchema = z
  .object({
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    orgSlug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-zA-Z0-9-]+$/, "Organization is invalid")
      .transform((value) => value.toLowerCase()),
  })
  .strict();

const verifyPasswordOtpSchema = recoveryIdentitySchema
  .extend({ otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits") })
  .strict();

const resetPasswordSchema = verifyPasswordOtpSchema
  .extend({ newPassword: z.string().min(8).max(256) })
  .strict();

const validate = (schema) => (request, _response, next) => {
  const result = schema.safeParse(request.body);

  if (!result.success) {
    const error = new Error("Invalid request");
    error.statusCode = 400;
    error.issues = result.error.issues.map(({ path, message }) => ({ path, message }));
    next(error);
    return;
  }

  request.body = result.data;
  next();
};

module.exports = {
  validateLogin: validate(loginSchema),
  validatePasswordOtpRequest: validate(recoveryIdentitySchema),
  validatePasswordOtpVerification: validate(verifyPasswordOtpSchema),
  validatePasswordReset: validate(resetPasswordSchema),
};
