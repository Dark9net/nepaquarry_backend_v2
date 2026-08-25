const { z } = require("zod");

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date");
const optionalText = (max) => z.string().trim().max(max).optional().transform((value) => value || undefined);

const createPartySchema = z.object({
  name: z.string().trim().min(1, "Party name is required").max(200),
  balanceType: z.enum(["CREDIT", "ADVANCE"]).optional(),
  creditBalance: z.coerce.number().nonnegative("Balance must be zero or greater"),
  panNo: optionalText(50),
  address: optionalText(300),
  contactPerson: optionalText(200),
  contactNo: optionalText(50),
  notes: optionalText(2000),
}).strict();

const updatePartySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  balanceType: z.enum(["CREDIT", "ADVANCE"]).optional(),
  creditBalance: z.coerce.number().nonnegative("Balance must be zero or greater").optional(),
  panNo: optionalText(50),
  address: optionalText(300),
  contactPerson: optionalText(200),
  contactNo: optionalText(50),
  notes: optionalText(2000),
  isActive: z.boolean().optional(),
  topupAmount: z.coerce.number().positive("Top-up amount must be greater than 0").optional(),
}).strict();

const upsertRateSchema = z.object({
  tripVehicleId: z.string().trim().min(1, "Vehicle is required"),
  materialId: z.string().trim().min(1, "Material is required"),
  ratePerTrip: z.coerce.number().positive("Rate must be greater than 0"),
}).strict();

const createTransactionSchema = z.object({
  creditPartyId: z.string().trim().min(1, "Credit party is required"),
  date: dateOnly,
  tripVehicleId: z.string().trim().min(1, "Vehicle is required"),
  materialId: z.string().trim().min(1, "Material is required"),
  trips: z.coerce.number().int().positive("Trips must be greater than zero"),
  rateUsed: z.coerce.number().positive("Rate must be greater than 0"),
  billNo: optionalText(100),
  notes: optionalText(2000),
}).strict();

const listPartiesQuerySchema = z.object({
  includeInactive: z.coerce.boolean().optional(),
});

const listTransactionsQuerySchema = z.object({
  creditPartyId: z.string().trim().min(1).optional(),
  date: dateOnly.optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
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
  validateCreateParty: validateBody(createPartySchema),
  validateUpdateParty: validateBody(updatePartySchema),
  validateUpsertRate: validateBody(upsertRateSchema),
  validateCreateTransaction: validateBody(createTransactionSchema),
  validateListPartiesQuery: validateQuery(listPartiesQuerySchema),
  validateListTransactionsQuery: validateQuery(listTransactionsQuerySchema),
};
