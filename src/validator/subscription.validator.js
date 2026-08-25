const { z } = require("zod");

const validateBody = (schema) => (request, _response, next) => {
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

// The organization's display name, not its slug. Names are free text —
// spaces, capitals, "&", "." are all legitimate — so the slug's
// [a-z0-9-] rule must NOT be applied here; it would reject real names like
// "MPIS Pvt. Ltd.". Case is preserved rather than lowercased, because the
// column is utf8mb4_unicode_ci and MySQL matches it case-insensitively
// anyway. Length is capped to match Organization.name's storage.
const orgNameField = z
  .string({ message: "Organization name is required" })
  .trim()
  .min(2, "Organization name must be at least 2 characters")
  .max(191, "Organization name must be 191 characters or less");

const contactNameField = z
  .string({ message: "Contact name is required" })
  .trim()
  .min(1, "Enter a contact name")
  .max(80, "Contact name must be 80 characters or less");

const emailField = z
  .string({ message: "Billing email is required" })
  .trim()
  .min(3, "Enter a billing email")
  .max(254, "Email must be 254 characters or less")
  .email("Enter a valid email address")
  .transform((value) => value.toLowerCase());

// Phone numbers vary a lot in format (spaces, +country code); cap length
// rather than lock a strict pattern, but still bound it well below what any
// real phone number needs so the field can't be used to smuggle other data.
const phoneField = z
  .string({ message: "Phone number is required" })
  .trim()
  .min(7, "Enter a valid contact number")
  .max(20, "Phone number must be 20 characters or less")
  .regex(/^[0-9+\-\s()]+$/, "Phone number can only contain digits, spaces, +, -, and parentheses");

const planIdField = z
  .string({ message: "Select a plan" })
  .trim()
  .min(1, "Select a plan")
  .max(60, "Plan id is invalid");

const providerField = z.enum(["ESEWA", "KHALTI", "FONEPAY", "CASH", "BANK_TRANSFER", "OTHERS"], {
  message: "Select a valid payment method",
});

// The 3 billing-details inputs on the Payment page: organization name, contact
// name, and phone are each capped well under 100 characters; email follows
// the RFC-ish limit used everywhere else in this codebase.
const billingDetailsSchema = z
  .object({
    orgName: orgNameField,
    contactName: contactNameField,
    email: emailField,
    phone: phoneField,
    planId: planIdField,
    provider: providerField,
  })
  .strict();

const referenceField = z
  .string()
  .trim()
  .max(60, "Reference must be 60 characters or less")
  .optional();

const amountField = z
  .preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z
      .number({ message: "Amount must be a valid number" })
      .finite("Amount must be a valid number")
      .positive("Amount must be greater than zero")
      // 10-digit ceiling, per the "max 10 for number" instruction.
      .max(9_999_999_999, "Amount is too large"),
  );

const checkoutSchema = z
  .object({
    orgName: orgNameField,
    contactName: contactNameField,
    email: emailField,
    phone: phoneField,
    planId: planIdField,
    provider: providerField,
    amount: amountField,
    reference: referenceField,
  })
  .strict();

module.exports = {
  validateBillingDetails: validateBody(billingDetailsSchema),
  validateCheckout: validateBody(checkoutSchema),
};
