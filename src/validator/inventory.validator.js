const { z } = require("zod");

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date");

const transactionCreateSchema = z.object({
  productId: z.string().trim().min(1),
  type:      z.enum(["IN", "OUT"]),
  quantity:  z.coerce.number().int().positive().max(1_000_000),
  date:      dateOnly,
  remarks:   z.string().trim().max(500).optional().transform((value) => value || undefined),
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
  validateTransactionCreate: validate(transactionCreateSchema),
};
