const { z } = require("zod");

const optionalText = z.string().trim().max(2000).optional().transform((value) => value || undefined);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date").transform((value) => new Date(`${value}T00:00:00.000Z`));

const leaveCreateSchema = z.object({
  staffId:      z.string().trim().min(1),
  leaveFrom:    date,
  leaveTo:      date,
  numberOfDays: z.coerce.number().int().min(1).max(365),
  reason:       z.string().trim().min(1).max(2000),
}).strict();

const leaveReviewSchema = z.object({
  status:     z.enum(["APPROVED", "REJECTED"]),
  reviewNote: optionalText,
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
  validateLeaveCreate: validate(leaveCreateSchema),
  validateLeaveReview: validate(leaveReviewSchema),
};
