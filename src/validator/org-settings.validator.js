const { z } = require("zod");

const nullableNonNegativeInt = z
  .union([z.number(), z.null()])
  .refine((value) => value === null || (Number.isInteger(value) && value >= 0), {
    message: "Limit must be zero or more",
  });

const updateOrgSettingsSchema = z
  .object({
    advanceRequestLimit: nullableNonNegativeInt,
    additionalAdvanceLimit: nullableNonNegativeInt,
  })
  .strict();

const userActivityQuerySchema = z.object({
  from: z.string().trim().min(1).optional(),
  to: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

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

const validateQuery = (schema) => (request, _response, next) => {
  const result = schema.safeParse(request.query);
  if (!result.success) {
    const error = new Error("Invalid request");
    error.statusCode = 400;
    error.issues = result.error.issues.map(({ path, message }) => ({ path, message }));
    next(error);
    return;
  }
  // Express 5 makes `request.query` a getter-only property, so a plain
  // assignment here silently no-ops and handlers keep seeing raw strings.
  Object.defineProperty(request, "query", {
    value: result.data,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
};

module.exports = {
  validateUpdateOrgSettings: validateBody(updateOrgSettingsSchema),
  validateUserActivityQuery: validateQuery(userActivityQuerySchema),
};
