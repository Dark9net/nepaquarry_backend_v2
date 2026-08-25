const { z } = require("zod");

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date");
const optionalDateOnly = z.union([dateOnly, z.null()]).optional();
const optionalText = (max) => z.union([z.string().trim().max(max), z.null()]).optional();

const itemSchema = z.object({
  itemName: z.string().trim().min(1, "Item name is required").max(200),
  partSerialNo: z.string().trim().max(100).optional().transform((value) => value || undefined),
  quantity: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
  unitCost: z.union([z.coerce.number().positive(), z.null()]).optional(),
});

const assetRefinement = (data, ctx) => {
  if (!data.vehicleId && !data.plantId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Select a plant or vehicle", path: ["vehicleId"] });
  }
  if (data.vehicleId && data.plantId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Select only one of plant or vehicle", path: ["vehicleId"] });
  }
};

const maintenanceCreateSchema = z.object({
  vehicleId: z.string().trim().min(1).optional(),
  plantId: z.string().trim().min(1).optional(),
  driverStaffId: z.string().trim().min(1).optional(),

  maintenanceDate: dateOnly,
  paymentDate: optionalDateOnly,
  odometer: z.union([z.coerce.number().int().min(0), z.null()]).optional(),
  nextServiceDate: optionalDateOnly,
  notes: optionalText(2000),

  items: z.array(itemSchema).min(1, "Add at least one maintenance item").max(50),
}).strict().superRefine(assetRefinement);

const maintenanceUpdateSchema = z.object({
  vehicleId: z.union([z.string().trim().min(1), z.null()]).optional(),
  plantId: z.union([z.string().trim().min(1), z.null()]).optional(),
  driverStaffId: z.union([z.string().trim().min(1), z.null()]).optional(),

  maintenanceDate: dateOnly.optional(),
  paymentDate: optionalDateOnly,
  odometer: z.union([z.coerce.number().int().min(0), z.null()]).optional(),
  nextServiceDate: optionalDateOnly,
  notes: optionalText(2000),

  items: z.array(itemSchema).max(50).optional(),
}).strict();

const reviewSchema = z.object({
  reviewNote: optionalText(2000),
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
  validateMaintenanceCreate: validate(maintenanceCreateSchema),
  validateMaintenanceUpdate: validate(maintenanceUpdateSchema),
  validateMaintenanceReview: validate(reviewSchema),
};
