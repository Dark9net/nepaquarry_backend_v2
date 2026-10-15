const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const { storedShopPaymentVoucherPaths, removeStoredShopPaymentVoucherFile } = require("../middleware/maintenanceUploads");

const shopInclude = {
  createdBy: { select: { id: true, user: { select: { name: true } } } },
  // Every job billed to this shop — set directly on the job at creation, so
  // "Total billed" reflects what's actually owed even before any payment
  // exists, rather than only what a payment happens to reference. Also
  // powers the ledger's "Jobs" tab (mirrors a supplier's `purchases`).
  maintenanceRecords: {
    orderBy: { maintenanceDate: "desc" },
    select: {
      id: true,
      maintenanceDate: true,
      totalCost: true,
      billPath: true,
      vehicle: { select: { id: true, VehicleModel: true, vehicleNo: true } },
      plant: { select: { id: true, name: true, location: true } },
      maintainancePayments: { select: { paidamount: true } },
    },
  },
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

const withTotals = (shop) => {
  const payments = shop.maintenancepayment ?? [];
  const totalPaidAmount = payments.reduce((sum, payment) => sum + Number(payment.paidamount || 0), 0);
  const totalBilledAmount = (shop.maintenanceRecords ?? []).reduce((sum, record) => sum + Number(record.totalCost || 0), 0);

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

const assertShopInOrg = async (orgId, id) => {
  const shop = await prisma.maintenanceShop.findFirst({ where: { id, orgId }, select: { id: true } });
  if (!shop) throw notFound();
};

const toPage = (data, total, { page, limit }) => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

// One shop's jobs, a page at a time, for the shop ledger's Jobs tab. Same
// fields and ordering as `shopInclude.maintenanceRecords`.
const listShopJobs = async (orgId, id, { page, limit }) => {
  await assertShopInOrg(orgId, id);
  const where = { orgId, shopId: id };
  const [total, data] = await prisma.$transaction([
    prisma.vehicleMaintenance.count({ where }),
    prisma.vehicleMaintenance.findMany({
      where,
      select: shopInclude.maintenanceRecords.select,
      orderBy: [{ maintenanceDate: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return toPage(data, total, { page, limit });
};

// One shop's payment history a page at a time, for the shop ledger's
// Payments tab. Same include and ordering as `listPayments`, plus a
// tie-breaker so pages stay stable.
const listShopPayments = async (orgId, id, { page, limit }) => {
  await assertShopInOrg(orgId, id);

  const where = { orgId, shopId: id };
  const [total, data] = await prisma.$transaction([
    prisma.maintenanceShopPayment.count({ where }),
    prisma.maintenanceShopPayment.findMany({
      where,
      include: paymentInclude,
      orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return toPage(data, total, { page, limit });
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

/*
 * Pays down the shop's total outstanding balance directly, allocating the
 * amount across that shop's own maintenance records oldest-first — the same
 * FIFO pattern as a supplier-ledger payment settling a supplier's oldest
 * purchases (see purchaseSuppliers.service.js#createSupplierPayment). Every
 * job already declares its shop at creation (VehicleMaintenance.shopId is
 * required), so this can never touch a job billed to a different shop. A
 * payment that covers more than one job is split into one
 * `maintenanceShopPayment` row per job it settles, all sharing the same
 * date/method/vouchers, so the maintenance list's own due badge and payment
 * ledger pick the allocation up automatically.
 */
const createPayment = async ({ orgId, memberId, data, voucherFiles = [] }) => {
  const shop = await prisma.maintenanceShop.findFirst({ where: { id: data.shopId, orgId } });
  if (!shop) throw notFound();

  if (voucherFiles.length === 0) {
    throw new AppError(400, "At least one voucher upload is required when recording a payment.");
  }

  const records = await prisma.vehicleMaintenance.findMany({
    where: { orgId, shopId: data.shopId },
    include: { maintainancePayments: { select: { paidamount: true } } },
    orderBy: [{ maintenanceDate: "asc" }, { createdAt: "asc" }],
  });

  const outstanding = records
    .map((record) => ({
      id: record.id,
      due: Number(record.totalCost) - record.maintainancePayments.reduce((sum, payment) => sum + Number(payment.paidamount || 0), 0),
    }))
    .filter((record) => record.due > 0);

  const totalDue = outstanding.reduce((sum, record) => sum + record.due, 0);
  if (totalDue <= 0) throw new AppError(400, "This shop has no outstanding balance.");

  const amounts = cheque(data);
  if (amounts.paidamount > totalDue) {
    throw new AppError(400, "Payment amount cannot exceed the outstanding due balance.");
  }

  const allocations = [];
  let remaining = amounts.paidamount;
  for (const record of outstanding) {
    if (remaining <= 0) break;
    const amount = Math.min(record.due, remaining);
    allocations.push({
      maintenanceId: record.id,
      amount,
      remainingAfter: Number((record.due - amount).toFixed(2)),
    });
    remaining -= amount;
  }

  const voucherPaths = JSON.stringify(storedShopPaymentVoucherPaths(voucherFiles));

  try {
    return await prisma.$transaction(
      allocations.map((allocation) =>
        prisma.maintenanceShopPayment.create({
          data: {
            orgId,
            shopId: data.shopId,
            maintenanceId: allocation.maintenanceId,
            paymentDate: asDate(data.paymentDate),
            paidamount: allocation.amount,
            remainingamount: allocation.remainingAfter,
            paymentMethod: data.paymentMethod,
            chequedetail: amounts.chequedetail,
            chequeamount: amounts.chequeamount,
            voucherPaths,
            remarks: data.remarks ?? null,
            createdById: memberId,
          },
          include: paymentInclude,
        })
      )
    );
  } catch (error) {
    storedShopPaymentVoucherPaths(voucherFiles).forEach((path) => removeStoredShopPaymentVoucherFile(path));
    throw error;
  }
};

const updatePayment = async ({ orgId, id, data }) => {
  const existing = await prisma.maintenanceShopPayment.findFirst({ where: { id, orgId } });
  if (!existing) throw new AppError(404, "Payment not found");

  const shop = await prisma.maintenanceShop.findFirst({ where: { id: data.shopId, orgId } });
  if (!shop) throw notFound();

  const amounts = cheque(data);

  // Which maintenance record this payment settles is assigned once by the
  // allocation in createPayment and is never re-editable here — only the
  // amount, date, method, and remarks can change.
  const remainingamount = await remainingFor({
    orgId,
    maintenanceId: existing.maintenanceId,
    paidNow: amounts.paidamount,
    excludePaymentId: id,
  });

  return prisma.maintenanceShopPayment.update({
    where: { id },
    data: {
      shopId: data.shopId,
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
  listShopJobs,
  listShopPayments,
  listPayments,
  createPayment,
  updatePayment,
  deletePayment,
};
