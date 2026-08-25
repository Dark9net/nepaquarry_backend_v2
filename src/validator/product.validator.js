const { z } = require("zod");

const optionalText = (max) => z.string().trim().max(max).optional().transform((value) => value || undefined);
const optionalDecimal = z.coerce.number().min(0).max(9_999_999.99).optional();

// ─── Product categories ─────────────────────────────────────────
const categoryFields = {
  name: z.string().trim().min(1).max(150),
};

const categoryCreateSchema = z.object(categoryFields).strict();
const categoryUpdateSchema = z.object({
  name: categoryFields.name.optional(),
  isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required");

// ─── Master products ─────────────────────────────────────────────
const productFields = {
  productCode: z.string().trim().min(1).max(50).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1).max(200),
  category: optionalText(150),
  size: optionalText(100),
  serialNo: optionalText(100),
  location: optionalText(150),
  reorderLevel: z.coerce.number().int().min(0).max(1_000_000).optional(),
  supplierAName: optionalText(200),
  supplierARate: optionalDecimal,
  supplierBName: optionalText(200),
  supplierBRate: optionalDecimal,
  supplierCName: optionalText(200),
  supplierCRate: optionalDecimal,
};

const productCreateSchema = z.object(productFields).strict();
const productUpdateSchema = z.object({
  ...Object.fromEntries(Object.entries(productFields).map(([key, schema]) => [key, schema.optional()])),
  isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required");

// ─── Pagination query (?page=&limit=) ─────────────────────────────
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
  validateCategoryCreate: validate(categoryCreateSchema),
  validateCategoryUpdate: validate(categoryUpdateSchema),
  validateProductCreate: validate(productCreateSchema),
  validateProductUpdate: validate(productUpdateSchema),
  validatePaginationQuery: validateQuery(paginationSchema),
};
