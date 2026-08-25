const { z } = require("zod");

const optionalText = (max) => z.string().trim().max(max).optional().transform((value) => value || undefined);
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date");

const orderCreateSchema = z.object({
  date:            dateOnly,
  productId:       z.string().trim().min(1),
  size:            optionalText(100),
  quantity:        z.coerce.number().int().positive().max(1_000_000),
  details:         optionalText(2000),
  usedFor:         optionalText(500),
  orderByStaffId:  z.string().trim().min(1),
  orderToMemberId: z.string().trim().min(1),
}).strict();

const statusRemarkSchema = z.object({
  statusRemark: optionalText(2000),
}).strict();

const orderSentSchema = z.object({
  orderSentDate: dateOnly,
}).strict();

const receivedSchema = z.object({
  goodsReceivedDate: dateOnly,
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
  validateOrderCreate: validate(orderCreateSchema),
  validateStatusRemark: validate(statusRemarkSchema),
  validateOrderSent: validate(orderSentSchema),
  validateReceived: validate(receivedSchema),
};
