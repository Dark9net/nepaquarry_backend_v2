const { z } = require("zod");

const optionalText = (max) => z.string().trim().max(max).optional().transform((value) => value || undefined);

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
};
