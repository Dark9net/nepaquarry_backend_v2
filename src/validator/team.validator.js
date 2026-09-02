const { z } = require("zod");

const roleEnum = z.enum(["ADMIN", "SUPERVISOR", "PROCUREMENT", "PURCHASE_STAFF", "EMPLOYEE", "GUEST"]);

const inviteMemberSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(200),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters").max(256),
  role: roleEnum,
}).strict();

const updateStatusSchema = z.object({
  isActive: z.boolean(),
}).strict();

const updateRoleSchema = z.object({
  role: roleEnum,
}).strict();

const listMembersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(256),
}).strict();

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
  validateInviteMember: validateBody(inviteMemberSchema),
  validateUpdateStatus: validateBody(updateStatusSchema),
  validateUpdateRole: validateBody(updateRoleSchema),
  validateListMembersQuery: validateQuery(listMembersQuerySchema),
  validateChangePassword: validateBody(changePasswordSchema),
};
