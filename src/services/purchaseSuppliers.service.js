const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const { removeStoredFile } = require("../middleware/purchaseUploads");

const asDate = (value) => new Date(`${value}T00:00:00.000Z`);

const supplierInclude = {
  createdBy: { select: { id: true, user: { select: { name: true } } } },
  purchases: {
    orderBy: { purchaseDate: "desc" },
    include: {
      payments: { select: { id: true, amount: true } },
    },
  },
  payments: {
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, user: { select: { name: true } } } },
      purchase:  { select: { id: true, serialNo: true, billNo: true, particular: true, billFilePath: true } },
    },
  },
};

const notFound = () => new AppError(404, "Supplier not found");

const withTotals = (supplier) => {
  const totalPurchaseAmount = supplier.purchases.reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);
  const totalPaidAmount = supplier.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const dueBalance = totalPurchaseAmount - totalPaidAmount;

  return {
    ...supplier,
    totalPurchaseAmount,
    totalPaidAmount,
    dueBalance,
  };
};

const listSuppliers = async (orgId) => {
  const suppliers = await prisma.purchaseSupplier.findMany({
    where: { orgId },
    include: supplierInclude,
    orderBy: { name: "asc" },
  });
  return suppliers.map(withTotals);
};

const findSupplier = async (orgId, id) => {
  const supplier = await prisma.purchaseSupplier.findFirst({ where: { id, orgId }, include: supplierInclude });
  if (!supplier) throw notFound();
  return withTotals(supplier);
};

const assertUniqueName = async (orgId, name, excludeId) => {
  const existing = await prisma.purchaseSupplier.findFirst({
    where: { orgId, name, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw new AppError(400, "A supplier with this name already exists.");
};

const createSupplier = async ({ orgId, memberId, data }) => {
  await assertUniqueName(orgId, data.name);

  const supplier = await prisma.purchaseSupplier.create({
    data: {
      orgId,
      name: data.name,
      contactNo: data.contactNo,
      panNo: data.panNo,
      address: data.address,
      notes: data.notes,
      createdById: memberId,
    },
    include: supplierInclude,
  });
  return withTotals(supplier);
};

const updateSupplier = async ({ orgId, id, data }) => {
  await findSupplier(orgId, id);
  await assertUniqueName(orgId, data.name, id);

  const supplier = await prisma.purchaseSupplier.update({
    where: { id },
    data: {
      name: data.name,
      contactNo: data.contactNo,
      panNo: data.panNo,
      address: data.address,
      notes: data.notes,
    },
    include: supplierInclude,
  });
  return withTotals(supplier);
};

const setSupplierStatus = async ({ orgId, id, isActive }) => {
  await findSupplier(orgId, id);

  const supplier = await prisma.purchaseSupplier.update({
    where: { id },
    data: { isActive },
    include: supplierInclude,
  });
  return withTotals(supplier);
};

// Pays down the supplier's overall due balance by allocating the amount
// against their outstanding purchases oldest-first, splitting across more
// than one purchase when the payment covers several of them. Each split is
// created as a normal purchase-linked payment (never `purchaseId: null`), so
// every place that reads a purchase's own `payments` — the Purchase list's
// per-row due amount, its "ready to review" state, its payment ledger — picks
// the allocation up automatically, instead of only the supplier's aggregate
// balance moving.
const createSupplierPayment = async ({ orgId, memberId, id, data, files }) => {
  const supplier = await prisma.purchaseSupplier.findFirst({ where: { id, orgId } });
  if (!supplier) throw notFound();

  const purchases = await prisma.purchase.findMany({
    where: { orgId, supplierId: id },
    include: { payments: { select: { amount: true } } },
    orderBy: [{ purchaseDate: "asc" }, { createdAt: "asc" }],
  });

  const outstanding = purchases
    .map((purchase) => ({
      id: purchase.id,
      due: Number(purchase.amount) - purchase.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    }))
    .filter((purchase) => purchase.due > 0);

  const totalDue = outstanding.reduce((sum, purchase) => sum + purchase.due, 0);
  if (totalDue <= 0) throw new AppError(400, "This supplier has no outstanding balance.");
  if (data.paymentAmount > totalDue) throw new AppError(400, "Payment amount cannot exceed the outstanding due balance.");

  const billFiles = files?.paymentBillFiles || [];
  const voucherFiles = files?.paymentVoucherFiles || [];
  if (voucherFiles.length === 0) throw new AppError(400, "At least one voucher upload is required when recording a payment.");

  const allocations = [];
  let remaining = data.paymentAmount;
  for (const purchase of outstanding) {
    if (remaining <= 0) break;
    const amount = Math.min(purchase.due, remaining);
    allocations.push({ purchaseId: purchase.id, amount });
    remaining -= amount;
  }

  const billPaths = billFiles.length ? JSON.stringify(billFiles.map((file) => `/uploads/purchase/${file.filename}`)) : null;
  const voucherPaths = JSON.stringify(voucherFiles.map((file) => `/uploads/purchase/${file.filename}`));

  try {
    return await prisma.$transaction(
      allocations.map((allocation) =>
        prisma.purchaseSupplierPayment.create({
          data: {
            orgId,
            supplierId:    id,
            purchaseId:    allocation.purchaseId,
            paymentDate:   asDate(data.paymentDate),
            amount:        allocation.amount,
            paymentMethod: data.paymentMethod,
            billPaths,
            voucherPaths,
            notes:         data.notes,
            createdById:   memberId,
          },
          include: { createdBy: { select: { id: true, user: { select: { name: true } } } } },
        })
      )
    );
  } catch (error) {
    billFiles.forEach((file) => removeStoredFile(`/uploads/purchase/${file.filename}`));
    voucherFiles.forEach((file) => removeStoredFile(`/uploads/purchase/${file.filename}`));
    throw error;
  }
};

module.exports = { listSuppliers, findSupplier, createSupplier, updateSupplier, setSupplierStatus, createSupplierPayment };
