const { z } = require("zod");

const optionalText = z.string().trim().max(500).optional().transform((value) => value || undefined);
const currentYear = new Date().getFullYear();

const vehicleFields = {
  VehicleModel: z.string().trim().min(1).max(200),
  vehicleNo: z.string().trim().min(1).max(50),
  vehicleType: optionalText,
  year: z.coerce.number().int().min(1990).max(currentYear + 1).optional(),
  driverStaffIds: z.array(z.string().trim().min(1)).max(50).optional(),
};

const vehicleCreateSchema = z.object(vehicleFields).strict();
const vehicleUpdateSchema = z.object({
  ...Object.fromEntries(Object.entries(vehicleFields).map(([key, schema]) => [key, schema.optional()])),
  isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required");

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
  validateVehicleCreate: validate(vehicleCreateSchema),
  validateVehicleUpdate: validate(vehicleUpdateSchema),
};
