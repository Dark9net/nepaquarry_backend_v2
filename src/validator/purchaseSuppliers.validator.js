const { z } = require("zod");

const optionalText = (max) => z.string().trim().max(max).optional().transform((value) => value || undefined);
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date");

const supplierSchema = z.object({
  name:      z.string().trim().min(1).max(200),
  contactNo: optionalText(30),
  panNo:     optionalText(30),
  address:   optionalText(300),
  notes:     optionalText(1000),
}).strict();

const statusSchema = z.object({
  isActive: z.boolean(),
}).strict();

// No CREDIT option here: a supplier-level payment pays down an existing due
// balance, whereas CREDIT describes a purchase that has no payment at all.
const supplierPaymentSchema = z.object({
  paymentDate:   dateOnly,
  paymentAmount: z.coerce.number().positive().max(100_000_000),
  paymentMethod: z.enum(["CHEQUE", "CASH_IN_COUNTER"]),
  notes:         optionalText(1000),
}).strict();

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
  validateSupplier: validate(supplierSchema),
  validateSupplierStatus: validate(statusSchema),
  validateSupplierPayment: validate(supplierPaymentSchema),
};
