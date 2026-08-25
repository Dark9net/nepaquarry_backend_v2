const { z } = require("zod");

const optionalText = z.string().trim().max(1000).optional().transform((value) => value || undefined);

const plantFields = {
  name: z.string().trim().min(1).max(200),
  description: optionalText,
  location: z.string().trim().max(300).optional().transform((value) => value || undefined),
};

const plantCreateSchema = z.object(plantFields).strict();
const plantUpdateSchema = z.object({
  ...Object.fromEntries(Object.entries(plantFields).map(([key, schema]) => [key, schema.optional()])),
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
  validatePlantCreate: validate(plantCreateSchema),
  validatePlantUpdate: validate(plantUpdateSchema),
};
