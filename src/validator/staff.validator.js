const { z } = require("zod");

const optionalText = z.string().trim().max(500).optional().transform((value) => value || undefined);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Join date must be a valid date").transform((value) => new Date(`${value}T00:00:00.000Z`));

const staffFields = {
  employeeCode: z.string().trim().min(1).max(10),
  fullName: z.string().trim().min(1).max(200),
  designation: z.string().trim().min(1).max(200),
  deptId: z.string().trim().min(1),
  phone: optionalText,
  email: z.string().trim().email().max(254).optional().or(z.literal("")).transform((value) => value || undefined),
  address: optionalText,
  familyContactName: optionalText,
  familyContactPhone: optionalText,
  familyContactRelation: optionalText,
  joinDate: date,
};

const departmentCreateSchema = z.object({
  name: z.string().trim().min(1).max(150),
  code: z.string().trim().min(1).max(50).regex(/^[A-Za-z0-9_-]+$/, "Department code is invalid").transform((value) => value.toUpperCase()),
}).strict();
const departmentUpdateSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required");
const staffCreateSchema = z.object(staffFields).strict();
const staffUpdateSchema = z.object({
  ...Object.fromEntries(Object.entries(staffFields).map(([key, schema]) => [key, schema.optional()])),
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
  validateDepartmentCreate: validate(departmentCreateSchema),
  validateDepartmentUpdate: validate(departmentUpdateSchema),
  validateStaffCreate: validate(staffCreateSchema),
  validateStaffUpdate: validate(staffUpdateSchema),
};
