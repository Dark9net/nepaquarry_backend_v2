const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const orderInclude = {
  product:       { select: { id: true, productCode: true, name: true, category: true, location: true, serialNo: true, reorderLevel: true, supplierAName: true, supplierARate: true, supplierBName: true, supplierBRate: true, supplierCName: true, supplierCRate: true, photo1: true, photo2: true, photo3: true } },
  orderByStaff:  { select: { id: true, fullName: true, employeeCode: true } },
  orderToMember: { select: { id: true, role: true, user: { select: { name: true } } } },
  createdBy:     { select: { id: true, user: { select: { name: true } } } },
  checkedBy:     { select: { id: true, user: { select: { name: true } } } },
  verifiedBy:    { select: { id: true, user: { select: { name: true } } } },
};

const notFound = (resource) => new AppError(404, `${resource} not found`);

const assertActiveProduct = async (orgId, productId) => {
  const product = await prisma.masterProduct.findFirst({ where: { id: productId, orgId, isActive: true } });
  if (!product) throw new AppError(400, "Select an active product in your organization.");
  return product;
};

const assertStaff = async (orgId, staffId) => {
  const staff = await prisma.staff.findFirst({ where: { id: staffId, orgId, deletedAt: null } });
  if (!staff) throw new AppError(400, "Select an active staff member in your organization.");
  return staff;
};

const assertMember = async (orgId, memberId) => {
  const member = await prisma.organizationMember.findFirst({ where: { id: memberId, orgId, isActive: true } });
  if (!member) throw new AppError(400, "Select an active organization member to order to.");
  return member;
};

const buildWhere = (orgId, { status, month, year }) => {
  const where = { orgId };
  if (status) where.status = status;
  if (month && year) {
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    where.date = {
      gte: new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`),
      lte: new Date(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`),
    };
  } else if (year) {
    where.date = { gte: new Date(`${year}-01-01T00:00:00.000Z`), lte: new Date(`${year}-12-31T23:59:59.999Z`) };
  }
  return where;
};

const listOrders = async (orgId, filters, pagination) => {
  const where = buildWhere(orgId, filters);
  const orderBy = [{ date: "desc" }, { createdAt: "desc" }];

  if (!pagination) {
    return prisma.orders.findMany({ where, include: orderInclude, orderBy });
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.orders.count({ where }),
    prisma.orders.findMany({ where, include: orderInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);
  return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

// Org-wide status breakdown for the period (ignores the status filter itself
// so stat cards reflect the whole month, not just the currently selected tab).
const getOrderStats = async (orgId, { month, year }) => {
  const where = buildWhere(orgId, { month, year });
  const [total, grouped] = await prisma.$transaction([
    prisma.orders.count({ where }),
    prisma.orders.groupBy({ by: ["status"], where, _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(grouped.map((row) => [row.status, row._count._all]));
  return {
    total,
    pending: counts.PENDING || 0,
    informed: counts.INFORMED || 0,
    procurementReceived: counts.PROCUREMENT_RECEIVED || 0,
    orderSent: counts.ORDER_SENT || 0,
    received: counts.RECEIVED || 0,
    verified: counts.VERIFIED || 0,
    needsClarification: counts.NEEDS_CLARIFICATION || 0,
    rejected: counts.REJECTED || 0,
    cancelled: counts.CANCELLED || 0,
  };
};

const createOrder = async ({ orgId, memberId, data }) => {
  const product = await assertActiveProduct(orgId, data.productId);
  await assertStaff(orgId, data.orderByStaffId);
  await assertMember(orgId, data.orderToMemberId);

  return prisma.orders.create({
    data: {
      orgId,
      productId:       data.productId,
      productCode:     product.productCode,
      productName:     product.name,
      size:            data.size,
      date:            new Date(`${data.date}T00:00:00.000Z`),
      quantity:        data.quantity,
      details:         data.details,
      usedFor:         data.usedFor,
      orderByStaffId:  data.orderByStaffId,
      orderToMemberId: data.orderToMemberId,
      createdById:     memberId,
    },
    include: orderInclude,
  });
};

const findOrder = async (orgId, id) => {
  const order = await prisma.orders.findFirst({ where: { id, orgId } });
  if (!order) throw notFound("Order");
  return order;
};

const assertStatus = (order, allowed, message) => {
  if (!allowed.includes(order.status)) throw new AppError(400, message);
};

const markInformed = async ({ orgId, id }) => {
  const order = await findOrder(orgId, id);
  assertStatus(order, ["PENDING", "NEEDS_CLARIFICATION"], "Only requested or clarification-needed orders can be marked informed.");

  return prisma.orders.update({
    where: { id },
    data: { status: "INFORMED", informed: true },
    include: orderInclude,
  });
};

const markProcurementReceived = async ({ orgId, memberId, id }) => {
  const order = await findOrder(orgId, id);
  assertStatus(order, ["INFORMED"], "Only informed orders can be accepted by procurement.");

  return prisma.orders.update({
    where: { id },
    data: { status: "PROCUREMENT_RECEIVED", checkedById: memberId },
    include: orderInclude,
  });
};

const markOrderSent = async ({ orgId, id, data }) => {
  const order = await findOrder(orgId, id);
  assertStatus(order, ["PROCUREMENT_RECEIVED"], "Only accepted orders can be marked as sent.");

  return prisma.orders.update({
    where: { id },
    data: { status: "ORDER_SENT", orderSentDate: new Date(`${data.orderSentDate}T00:00:00.000Z`) },
    include: orderInclude,
  });
};

const markReceived = async ({ orgId, id, data }) => {
  const order = await findOrder(orgId, id);
  assertStatus(order, ["ORDER_SENT"], "Only sent orders can be marked as received.");

  return prisma.orders.update({
    where: { id },
    data: { status: "RECEIVED", goodsReceivedDate: new Date(`${data.goodsReceivedDate}T00:00:00.000Z`) },
    include: orderInclude,
  });
};

const requestClarification = async ({ orgId, id, data }) => {
  const order = await findOrder(orgId, id);
  assertStatus(order, ["INFORMED", "PROCUREMENT_RECEIVED"], "Only informed or accepted orders can be sent back for clarification.");

  return prisma.orders.update({
    where: { id },
    data: { status: "NEEDS_CLARIFICATION", statusRemark: data.statusRemark },
    include: orderInclude,
  });
};

const rejectOrder = async ({ orgId, id, data }) => {
  const order = await findOrder(orgId, id);
  assertStatus(order, ["PENDING", "INFORMED", "PROCUREMENT_RECEIVED", "NEEDS_CLARIFICATION"], "This order can no longer be rejected.");

  return prisma.orders.update({
    where: { id },
    data: { status: "REJECTED", statusRemark: data.statusRemark },
    include: orderInclude,
  });
};

const cancelOrder = async ({ orgId, id, data }) => {
  const order = await findOrder(orgId, id);
  assertStatus(order, ["PENDING", "INFORMED", "PROCUREMENT_RECEIVED", "NEEDS_CLARIFICATION"], "This order can no longer be cancelled.");

  return prisma.orders.update({
    where: { id },
    data: { status: "CANCELLED", statusRemark: data.statusRemark },
    include: orderInclude,
  });
};

const verifyOrder = async ({ orgId, memberId, id }) => {
  const order = await findOrder(orgId, id);
  assertStatus(order, ["RECEIVED"], "Only received orders can be verified.");

  return prisma.orders.update({
    where: { id },
    data: { status: "VERIFIED", verifiedById: memberId, verifiedAt: new Date() },
    include: orderInclude,
  });
};

const deleteOrder = async ({ orgId, id }) => {
  const order = await findOrder(orgId, id);
  if (order.status !== "PENDING") throw new AppError(400, "Only pending orders can be deleted.");

  await prisma.orders.delete({ where: { id } });
  return { id };
};

module.exports = {
  listOrders,
  getOrderStats,
  createOrder,
  markInformed,
  markProcurementReceived,
  markOrderSent,
  markReceived,
  requestClarification,
  rejectOrder,
  cancelOrder,
  verifyOrder,
  deleteOrder,
};
