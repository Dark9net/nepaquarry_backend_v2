const { z } = require("zod");

const optionalText = (max) => z.string().trim().max(max).optional().transform((value) => value || undefined);
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date");

// Contact numbers are exactly 10 digits. An empty string is treated as "not
// provided" rather than a validation failure, so the field stays optional.
const contactNo = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)
  .refine(
    (value) => value === undefined || /^\d{10}$/.test(value),
    "Contact number must be exactly 10 digits",
  );

const shopSchema = z.object({
  name:      z.string().trim().min(1).max(200),
  contactNo,
  panNo:     optionalText(30),
  address:   optionalText(300),
  notes:     optionalText(1000),
}).strict();

const statusSchema = z.object({
  isActive: z.boolean(),
}).strict();

/*
 * Maintenance payments accept only CASH and CHEQUE. The underlying column
 * keeps the wider PaymentProvider enum so rows written before this narrowing
 * (eSewa, Khalti, FonePay, bank transfer) still read back, but no new payment
 * may use them.
 *
 * For CHEQUE the client sends `chequeamount` and leaves `paidamount` off —
 * the amount field is disabled in that mode. The service mirrors the cheque
 * amount into `paidamount` so it reduces the linked maintenance record's
 * outstanding balance, which is why `paidamount` is optional here and the
 * refinements below enforce exactly one of the two per method.
 *
 * `remainingamount` is intentionally absent — the service derives it.
 */
// Shared by every payment schema below: exactly one of "cash amount" or
// "cheque amount + detail" must be present, matching whichever paymentMethod
// was chosen.
const chequeCashRefinement = (value, ctx) => {
  if (value.paymentMethod === "CHEQUE") {
    if (value.chequeamount === undefined) {
      ctx.addIssue({ code: "custom", path: ["chequeamount"], message: "Cheque amount is required" });
    }
    if (!value.chequedetail) {
      ctx.addIssue({ code: "custom", path: ["chequedetail"], message: "Cheque detail is required" });
    }
    return;
  }

  // CASH: the cheque fields must not be smuggled in alongside it, or a row
  // could claim a cheque value that no cheque backs.
  if (value.paidamount === undefined) {
    ctx.addIssue({ code: "custom", path: ["paidamount"], message: "Amount must be greater than 0" });
  }
  if (value.chequeamount !== undefined || value.chequedetail) {
    ctx.addIssue({
      code: "custom",
      path: ["chequeamount"],
      message: "Cheque details apply only to cheque payments",
    });
  }
};

// No `maintenanceId` here — the service allocates the amount across the
// shop's own oldest unpaid maintenance records automatically rather than
// against one record picked by the client.
const paymentSchema = z.object({
  shopId:        z.string().trim().min(1, "Shop is required"),
  paymentDate:   dateOnly,
  paidamount:    z.coerce.number().positive("Amount must be greater than 0").max(99999999.99).optional(),
  paymentMethod: z.enum(["CASH", "CHEQUE"]).default("CASH"),
  chequedetail:  optionalText(1000),
  chequeamount:  z.coerce.number().positive("Cheque amount must be greater than 0").max(99999999.99).optional(),
  remarks:       optionalText(1000),
})
  .strict()
  .superRefine(chequeCashRefinement);

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
  validateShop: validate(shopSchema),
  validateShopStatus: validate(statusSchema),
  validatePayment: validate(paymentSchema),
};
