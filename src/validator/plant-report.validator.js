const { z } = require("zod");

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date");
const dateTime = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/));
const optionalDateTime = z.union([dateTime, z.null()]).optional();
const optionalText = (max) => z.union([z.string().trim().max(max), z.null()]).optional();
const optionalHours = z.union([z.coerce.number().min(0).max(999.99), z.null()]).optional();

const componentSchema = z.object({
  name: z.string().trim().min(1, "Component name is required").max(200),
  details: z.string().trim().max(1000).optional().transform((value) => value || undefined),
  serialNo: z.string().trim().max(100).optional().transform((value) => value || undefined),
});

const reportCreateSchema = z.object({
  plantId: z.string().trim().min(1, "Plant is required"),
  date: dateOnly,
  status: z.enum(["RUNNING", "MAINTENANCE", "RUNNING_AND_MAINTENANCE"]),

  plantStartTime: optionalDateTime,
  plantStopTime: optionalDateTime,
  plantWorkingHours: optionalHours,

  maintenanceDescription: optionalText(2000),
  maintenanceStartTime: optionalDateTime,
  maintenanceEndTime: optionalDateTime,
  maintenanceHours: optionalHours,

  remarks: optionalText(2000),
  components: z.array(componentSchema).max(50).optional().default([]),
}).strict();

const reportUpdateSchema = z.object({
  status: z.enum(["RUNNING", "MAINTENANCE", "RUNNING_AND_MAINTENANCE"]).optional(),

  plantStartTime: optionalDateTime,
  plantStopTime: optionalDateTime,
  plantWorkingHours: optionalHours,

  maintenanceDescription: optionalText(2000),
  maintenanceStartTime: optionalDateTime,
  maintenanceEndTime: optionalDateTime,
  maintenanceHours: optionalHours,

  remarks: optionalText(2000),
  components: z.array(componentSchema).max(50).optional(),
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
  validateReportCreate: validate(reportCreateSchema),
  validateReportUpdate: validate(reportUpdateSchema),
};
