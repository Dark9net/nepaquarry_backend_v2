const { z } = require("zod");

const optionalText = z.string().trim().max(2000).optional().transform((value) => value || undefined);

const materialFields = {
  name: z.string().trim().min(1).max(200),
  description: optionalText,
};

const materialCreateSchema = z.object(materialFields).strict();
const materialUpdateSchema = z.object({
  ...Object.fromEntries(Object.entries(materialFields).map(([key, schema]) => [key, schema.optional()])),
  isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required");

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).passthrough();

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

const validateQuery = (schema) => (request, _response, next) => {
  const result = schema.safeParse(request.query);
  if (!result.success) {
    const error = new Error("Invalid query");
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
  validateMaterialCreate: validate(materialCreateSchema),
  validateMaterialUpdate: validate(materialUpdateSchema),
  validatePaginationQuery: validateQuery(paginationSchema),
};
