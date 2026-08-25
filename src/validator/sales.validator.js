const { z } = require("zod");

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date");

/*
 * Row cap for every repeatable section of the report. Must stay >= the
 * frontend's MAX_FORM_ROWS (Sales.tsx), which lets a user add up to 18 rows:
 * a lower value here rejects a report the UI happily accepted, and the user
 * only sees "Invalid request" with no clue which section was at fault.
 *
 * The Expenses section makes this easy to hit without typing 6 rows at all —
 * it auto-populates from maintenance, advances, purchase payments and
 * maintenance-shop cash payments before the user adds anything.
 */
const MAX_ROWS = 18;

/*
 * Every money column on the report is Decimal(10,2) — 10 significant digits
 * with 2 after the point, so 8 integer digits (99,999,999.99) is the true
 * ceiling. MySQL does not reject a larger value, it silently CLAMPS it to the
 * maximum, so a mistyped 999999999 would be stored as 99999999.99 and look
 * deliberate. Validating here turns that into an error the user can see.
 */
const MAX_AMOUNT = 99999999.99;

const money = (label = "Amount") =>
  z.coerce
    .number()
    .nonnegative(`${label} must be zero or greater`)
    .max(MAX_AMOUNT, `${label} cannot exceed 8 digits (99,999,999.99)`);

// Same ceiling, but the field is allowed to be negative (an opening balance
// can legitimately be carried forward as a deficit).
const signedMoney = (label = "Amount") =>
  z.coerce
    .number()
    .min(-MAX_AMOUNT, `${label} cannot exceed 8 digits (99,999,999.99)`)
    .max(MAX_AMOUNT, `${label} cannot exceed 8 digits (99,999,999.99)`);
const expenseType = z.enum(["MAINTENANCE", "ADVANCE", "PURCHASE", "PT_CASH", "DONATION", "MISC", "DISCOUNT"]);

const expenseSchema = z.object({
  type: expenseType,
  particular: z.string().trim().min(1, "Particular is required").max(300),
  amount: money(),
  partyName: z.string().trim().max(200).optional(),
  maintenanceId: z.string().trim().min(1).optional(),
  advanceId: z.string().trim().min(1).optional(),
  purchaseId: z.string().trim().min(1).optional(),
  staffId: z.string().trim().min(1).optional(),
});

const saleSchema = z.object({
  materialId: z.string().trim().min(1, "Material is required"),
  tripVehicleId: z.string().trim().min(1, "Vehicle is required"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than zero"),
});

const creditSaleSchema = z.object({
  partyName: z.string().trim().min(1, "Party name is required").max(200),
  billNo: z.string().trim().max(100).optional(),
  goodsName: z.string().trim().max(200).optional(),
  amount: money(),
});

const bankDepositSchema = z.object({
  party: z.string().trim().max(200).optional(),
  amount: money("Bank deposit"),
});

const salesReturnSchema = z.object({
  partyName: z.string().trim().min(1, "Party name is required").max(200),
  billNo: z.string().trim().max(100).optional(),
  particular: z.string().trim().max(300).optional(),
  amount: money(),
  deductionBy: z.enum(["BANK", "QR", "CASH"]),
  remarks: z.string().trim().max(500).optional(),
});

const createReportSchema = z.object({
  date: dateOnly,
  lastClosingAmount: signedMoney("Last closing amount"),
  bankDepositParty: z.string().trim().max(200).optional(),
  bankDepositAmount: money("Bank deposit").default(0),
  bankDeposits: z.array(bankDepositSchema).max(MAX_ROWS).optional(),
  customerDeposit: money("Customer deposit").optional(),
  cashParticular: z.string().trim().max(300).optional(),
  cash: money("Cash"),
  cashReceiveExtraParticular: z.string().trim().max(300).optional(),
  cashReceiveExtra: money("Cash receive extra"),
  onlineTransfer: money("Online transfer"),
  voidCount: z.coerce.number().int().nonnegative().default(0),
  expenses: z.array(expenseSchema).max(MAX_ROWS).default([]),
  sales: z.array(saleSchema).max(MAX_ROWS).default([]),
  creditSales: z.array(creditSaleSchema).max(MAX_ROWS).optional(),
  salesReturns: z.array(salesReturnSchema).max(MAX_ROWS).optional(),
}).strict();

const createSaleEntrySchema = z.object({
  date: dateOnly,
  materialId: z.string().trim().min(1, "Material is required"),
  tripVehicleId: z.string().trim().min(1, "Vehicle is required"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than zero"),
}).strict();

const listReportsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const initReportQuerySchema = z.object({
  date: dateOnly,
});

const summaryQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100),
  view: z.enum(["daily", "weekly", "monthly"]),
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
  validateCreateReport: validateBody(createReportSchema),
  validateCreateSaleEntry: validateBody(createSaleEntrySchema),
  validateListReportsQuery: validateQuery(listReportsQuerySchema),
  validateInitReportQuery: validateQuery(initReportQuerySchema),
  validateSummaryQuery: validateQuery(summaryQuerySchema),
};
