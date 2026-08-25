const { z } = require("zod");

const optionalText = z.string().trim().max(2000).optional().transform((value) => value || undefined);
const currentYear = new Date().getFullYear();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date").transform((value) => new Date(`${value}T00:00:00.000Z`));

const advanceCreateSchema = z.object({
  staffId:      z.string().trim().min(1),
  advanceMonth: z.coerce.number().int().min(1).max(12),
  advanceYear:  z.coerce.number().int().min(currentYear - 5).max(currentYear + 1),
  // Zero is allowed only for a cheque advance, where the value lives in
  // `chequeamount` instead — see the superRefine below.
  amount:       z.coerce.number().nonnegative().max(10_000_000),
  reason:       optionalText,
  paymentMethod: z.enum(["CASH", "CHEQUE"]).default("CASH"),
  chequeDetails: optionalText,
  chequeamount: z.coerce.number().positive().max(10_000_000).optional(),
})
  .strict()
  .superRefine((value, ctx) => {
    if (value.paymentMethod === "CHEQUE") {
      // Cheque details only mean anything for a cheque payment, and are
      // required there — otherwise the record says "cheque" with nothing to
      // identify it.
      if (!value.chequeDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chequeDetails"],
          message: "Cheque details are required when the payment method is cheque.",
        });
      }
      // A cheque advance carries its value in `chequeamount`; without it the
      // record would be worth nothing at all.
      if (value.chequeamount === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chequeamount"],
          message: "Cheque amount is required when the payment method is cheque.",
        });
      }
      return;
    }

    // Cash keeps its value in `amount`, so zero there is meaningless.
    if (!(value.amount > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Amount must be greater than zero.",
      });
    }
  })
  .transform((value) => (
    value.paymentMethod === "CHEQUE"
      // The cash `amount` is forced to zero so a cheque never lands in the
      // cash-expense ledger; the value is carried by `chequeamount`.
      ? { ...value, amount: 0 }
      // A later switch back to cash must not leave stale cheque data behind.
      : { ...value, chequeDetails: undefined, chequeamount: undefined }
  ));

const advanceReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
}).strict();

const additionalRequestSchema = z.object({
  // Zero is allowed only for a cheque additional advance, where the value lives
  // in `additionalChequeamount` instead — see the superRefine below.
  additionalAmount: z.coerce.number().nonnegative().max(10_000_000),
  additionalReason: optionalText,
  additionalPaymentMethod: z.enum(["CASH", "CHEQUE"]).default("CASH"),
  additionalChequeDetails: optionalText,
  additionalChequeamount: z.coerce.number().positive().max(10_000_000).optional(),
})
  .strict()
  .superRefine((value, ctx) => {
    if (value.additionalPaymentMethod === "CHEQUE") {
      // Cheque details only mean anything for a cheque payment, and are
      // required there — otherwise the record says "cheque" with nothing to
      // identify it.
      if (!value.additionalChequeDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["additionalChequeDetails"],
          message: "Cheque details are required when the payment method is cheque.",
        });
      }
      // A cheque additional advance carries its value in
      // `additionalChequeamount`; without it the record would be worth nothing.
      if (value.additionalChequeamount === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["additionalChequeamount"],
          message: "Cheque amount is required when the payment method is cheque.",
        });
      }
      return;
    }

    // Cash keeps its value in `additionalAmount`, so zero there is meaningless.
    if (!(value.additionalAmount > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["additionalAmount"],
        message: "Additional amount must be greater than zero.",
      });
    }
  })
  .transform((value) => (
    value.additionalPaymentMethod === "CHEQUE"
      // The cash `additionalAmount` is forced to zero so a cheque never lands
      // in the cash-expense ledger; the value is carried by
      // `additionalChequeamount`.
      ? { ...value, additionalAmount: 0 }
      // A later switch back to cash must not leave stale cheque data behind.
      : { ...value, additionalChequeDetails: undefined, additionalChequeamount: undefined }
  ));

const additionalReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
}).strict();

const submitDateSchema = z.object({
  slot:      z.enum(["main", "additional"]),
  takenDate: date,
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
  validateAdvanceCreate: validate(advanceCreateSchema),
  validateAdvanceReview: validate(advanceReviewSchema),
  validateAdditionalRequest: validate(additionalRequestSchema),
  validateAdditionalReview: validate(additionalReviewSchema),
  validateSubmitDate: validate(submitDateSchema),
};
