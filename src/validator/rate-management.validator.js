const { z } = require("zod");

const tripVehicleCreateSchema = z.object({
  vehicleModel: z.string().trim().min(1, "Vehicle model is required").max(200),
  volume: z.coerce.number().positive("Volume must be greater than 0"),
}).strict();

const tripVehicleUpdateSchema = z.object({
  vehicleModel: z.string().trim().min(1).max(200).optional(),
  volume: z.coerce.number().positive("Volume must be greater than 0").optional(),
  isActive: z.boolean().optional(),
}).strict();

const previewRateSchema = z.object({
  referenceVehicleId: z.string().trim().min(1, "Reference vehicle is required"),
  basePrice: z.coerce.number().positive("Base price must be greater than 0"),
}).strict();

const setRateSchema = z.object({
  materialId: z.string().trim().min(1, "Material is required"),
  referenceVehicleId: z.string().trim().min(1, "Reference vehicle is required"),
  basePrice: z.coerce.number().positive("Base price must be greater than 0"),
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
  validateTripVehicleCreate: validate(tripVehicleCreateSchema),
  validateTripVehicleUpdate: validate(tripVehicleUpdateSchema),
  validatePreviewRate: validate(previewRateSchema),
  validateSetRate: validate(setRateSchema),
};
