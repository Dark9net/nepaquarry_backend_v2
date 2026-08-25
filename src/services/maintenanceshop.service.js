const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const shopInclude = {
  createdBy: { select: { id: true, user: { select: { name: true } } } },
  maintenancepayment: {
    orderBy: { paymentDate: "desc" },
    include: {
      createdBy: { select: { id: true, user: { select: { name: true } } } },
      maintenance: {
        select: {
          id: true,
          maintenanceDate: true,
          totalCost: true,
          vehicle: { select: { id: true, VehicleModel: true, vehicleNo: true } },
          plant: { select: { id: true, name: true, location: true } },
        },
      },
    },
  },
};

const notFound = () => new AppError(404, "Maintenance shop not found");

// Paid total comes from this shop's own payments. Billed total counts each
// linked maintenance record once, since several payments (installments) can
// point at the same record.
const withTotals = (shop) => {
  const payments = shop.maintenancepayment ?? [];
  const totalPaidAmount = payments.reduce((sum, payment) => sum + Number(payment.paidamount || 0), 0);

  const billedByMaintenance = new Map();
  payments.forEach((payment) => {
    if (payment.maintenance) {
      billedByMaintenance.set(payment.maintenance.id, Number(payment.maintenance.totalCost || 0));
    }
  });
  const totalBilledAmount = [...billedByMaintenance.values()].reduce((sum, value) => sum + value, 0);

  return {
    ...shop,
    totalPaidAmount,
    totalBilledAmount,
    dueBalance: totalBilledAmount - totalPaidAmount,
    paymentCount: payments.length,
  };
};

// Search runs in the database rather than on the client so it covers every
// shop, not just the rows on the current page.
const buildWhere = (orgId, search) => {
  const where = { orgId };
  const term = (search || "").trim();
  if (term) {
    where.OR = [
      { name: { contains: term } },
      { contactNo: { contains: term } },
      { panNo: { contains: term } },
      { address: { contains: term } },
    ];
  }
  return where;
};

/**
 * Without `pagination` the full list is returned, shaped like a single page so
 * callers can read it the same way either way.
 */
const listShops = async (orgId, { search, pagination } = {}) => {
  const where = buildWhere(orgId, search);
  const orderBy = { name: "asc" };

  if (!pagination) {
    const shops = await prisma.maintenanceShop.findMany({ where, include: shopInclude, orderBy });
    const data = shops.map(withTotals);
    return { data, total: data.length, page: 1, limit: data.length || 1, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const [total, shops] = await prisma.$transaction([
    prisma.maintenanceShop.count({ where }),
    prisma.maintenanceShop.findMany({
      where,
      include: shopInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: shops.map(withTotals),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

const findShop = async (orgId, id) => {
  const shop = await prisma.maintenanceShop.findFirst({ where: { id, orgId }, include: shopInclude });
  if (!shop) throw notFound();
  return withTotals(shop);
};

const assertUniqueName = async (orgId, name, excludeId) => {
  const existing = await prisma.maintenanceShop.findFirst({
    where: { orgId, name, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw new AppError(400, "A maintenance shop with this name already exists.");
};

const createShop = async ({ orgId, memberId, data }) => {
  await assertUniqueName(orgId, data.name);

  const shop = await prisma.maintenanceShop.create({
    data: {
      orgId,
      name: data.name,
      contactNo: data.contactNo,
      panNo: data.panNo,
      address: data.address,
      notes: data.notes,
      createdById: memberId,
    },
    include: shopInclude,
  });
  return withTotals(shop);
};

const updateShop = async ({ orgId, id, data }) => {
  await findShop(orgId, id);
  await assertUniqueName(orgId, data.name, id);

  const shop = await prisma.maintenanceShop.update({
    where: { id },
    data: {
      name: data.name,
      contactNo: data.contactNo,
      panNo: data.panNo,
      address: data.address,
      notes: data.notes,
    },
    include: shopInclude,
  });
  return withTotals(shop);
};

const setShopStatus = async ({ orgId, id, isActive }) => {
  await findShop(orgId, id);

  const shop = await prisma.maintenanceShop.update({
    where: { id },
    data: { isActive },
    include: shopInclude,
  });
  return withTotals(shop);
};

const paymentInclude = {
  createdBy: { select: { id: true, user: { select: { name: true } } } },
  shop: { select: { id: true, name: true, contactNo: true } },
  maintenance: {
    select: {
      id: true,
      maintenanceDate: true,
      totalCost: true,
      vehicle: { select: { id: true, VehicleModel: true, vehicleNo: true } },
      plant: { select: { id: true, name: true, location: true } },
    },
  },
};

// Date-only column: pin to UTC so the stored day cannot shift with the
// server's timezone.
const asDate = (value) => new Date(`${value}T00:00:00.000Z`);

const listPayments = async (orgId, { shopId } = {}) =>
  prisma.maintenanceShopPayment.findMany({
    where: { orgId, ...(shopId ? { shopId } : {}) },
    include: paymentInclude,
    orderBy: { paymentDate: "desc" },
  });

/**
 * `remainingamount` is derived here rather than trusted from the client: it is
 * the linked maintenance bill minus everything paid against that record,
 * including this payment. With no linked record there is nothing to owe
 * against, so it settles at 0.
 */
const remainingFor = async ({ orgId, maintenanceId, paidNow, excludePaymentId }) => {
  if (!maintenanceId) return 0;

  const maintenance = await prisma.vehicleMaintenance.findFirst({
    where: { id: maintenanceId, orgId },
    select: { totalCost: true },
  });
  if (!maintenance) throw new AppError(404, "Maintenance record not found");

  const others = await prisma.maintenanceShopPayment.findMany({
    where: {
      orgId,
      maintenanceId,
      ...(excludePaymentId ? { id: { not: excludePaymentId } } : {}),
    },
    select: { paidamount: true },
  });

  const alreadyPaid = others.reduce((sum, payment) => sum + Number(payment.paidamount || 0), 0);
  const remaining = Number(maintenance.totalCost || 0) - alreadyPaid - Number(paidNow || 0);
  return Math.max(0, Number(remaining.toFixed(2)));
};

/*
 * A cheque payment carries its value in `chequeamount` (the form disables the
 * plain amount field in that mode). The value is mirrored into `paidamount`
 * here so everything downstream — `remainingFor`, the shop's Total Paid, the
 * maintenance record's outstanding due — treats a cheque exactly like cash
 * without every one of those call sites needing to know about cheques.
 *
 * Returns the fields to persist, so create and update cannot drift apart.
 */
const cheque = (data) => {
  if (data.paymentMethod !== "CHEQUE") {
    return { paidamount: data.paidamount, chequedetail: null, chequeamount: null };
  }
  return {
    paidamount: data.chequeamount,
    chequedetail: data.chequedetail ?? null,
    chequeamount: data.chequeamount,
  };
};

const createPayment = async ({ orgId, memberId, data }) => {
  const shop = await prisma.maintenanceShop.findFirst({ where: { id: data.shopId, orgId } });
  if (!shop) throw notFound();

  const amounts = cheque(data);

  const remainingamount = await remainingFor({
    orgId,
    maintenanceId: data.maintenanceId,
    paidNow: amounts.paidamount,
  });

  return prisma.maintenanceShopPayment.create({
    data: {
      orgId,
      shopId: data.shopId,
      maintenanceId: data.maintenanceId ?? null,
      paymentDate: asDate(data.paymentDate),
      paidamount: amounts.paidamount,
      remainingamount,
      paymentMethod: data.paymentMethod,
      chequedetail: amounts.chequedetail,
      chequeamount: amounts.chequeamount,
      remarks: data.remarks ?? null,
      createdById: memberId,
    },
    include: paymentInclude,
  });
};

const updatePayment = async ({ orgId, id, data }) => {
  const existing = await prisma.maintenanceShopPayment.findFirst({ where: { id, orgId } });
  if (!existing) throw new AppError(404, "Payment not found");

  const shop = await prisma.maintenanceShop.findFirst({ where: { id: data.shopId, orgId } });
  if (!shop) throw notFound();

  const amounts = cheque(data);

  const remainingamount = await remainingFor({
    orgId,
    maintenanceId: data.maintenanceId,
    paidNow: amounts.paidamount,
    excludePaymentId: id,
  });

  return prisma.maintenanceShopPayment.update({
    where: { id },
    data: {
      shopId: data.shopId,
      maintenanceId: data.maintenanceId ?? null,
      paymentDate: asDate(data.paymentDate),
      paidamount: amounts.paidamount,
      remainingamount,
      paymentMethod: data.paymentMethod,
      // Cleared when switching a cheque payment back to cash, so a stale
      // cheque value can never linger on a cash row.
      chequedetail: amounts.chequedetail,
      chequeamount: amounts.chequeamount,
      remarks: data.remarks ?? null,
    },
    include: paymentInclude,
  });
};

const deletePayment = async ({ orgId, id }) => {
  const existing = await prisma.maintenanceShopPayment.findFirst({ where: { id, orgId } });
  if (!existing) throw new AppError(404, "Payment not found");

  await prisma.maintenanceShopPayment.delete({ where: { id } });
  return { id };
};

module.exports = {
  listShops,
  findShop,
  createShop,
  updateShop,
  setShopStatus,
  listPayments,
  createPayment,
  updatePayment,
  deletePayment,
};
