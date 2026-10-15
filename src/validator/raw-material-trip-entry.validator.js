const { z } = require("zod");

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date");

const hourCount = z.union([z.number(), z.null()]).optional();

const tripEntryUpsertSchema = z.object({
  id: z.string().trim().min(1).optional(),
  date: dateOnly,
  staffId: z.string().trim().min(1, "Driver is required"),
  materialId: z.string().trim().min(1).optional(),
  hours: z.record(z.string(), hourCount),
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
  validateTripEntryUpsert: validate(tripEntryUpsertSchema),
};
