const { z } = require("zod");

const optionalText = (max) => z.string().trim().max(max).optional().transform((value) => value || undefined);
const requiredText = (max) => z.string().trim().min(1).max(max);
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date");
const boolFromForm = z.union([z.literal("true"), z.literal("false")]).optional().transform((value) => value === "true");

const purchaseCreateSchema = z.object({
  purchaseDate:  dateOnly,
  partyName:     requiredText(200),
  contactNo:     requiredText(30),
  panNo:         optionalText(30),
  address:       optionalText(300),
  particular:    requiredText(500),
  amount:        z.coerce.number().positive().max(100_000_000),
  billNo:        requiredText(100),
  paymentMethod: z.enum(["CREDIT", "CHEQUE", "CASH_IN_COUNTER"]),
  supplierId:    optionalText(100),
  paymentDate:   z.union([dateOnly, z.literal("")]).optional().transform((value) => value || undefined),
  paymentAmount: z.coerce.number().positive().max(100_000_000).optional(),
  paymentNote:   optionalText(1000),
  clearVoucher:  boolFromForm,
}).strict();

const purchaseUpdateSchema = purchaseCreateSchema;

const purchasePaymentSchema = z.object({
  paymentDate:   dateOnly,
  paymentAmount: z.coerce.number().positive().max(100_000_000),
  paymentMethod: z.enum(["CREDIT", "CHEQUE", "CASH_IN_COUNTER"]),
  notes:         optionalText(1000),
}).strict();

const purchaseReviewSchema = z.object({
  reviewNote: optionalText(1000),
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
  validatePurchaseCreate: validate(purchaseCreateSchema),
  validatePurchaseUpdate: validate(purchaseUpdateSchema),
  validatePurchasePayment: validate(purchasePaymentSchema),
  validatePurchaseReview: validate(purchaseReviewSchema),
};
