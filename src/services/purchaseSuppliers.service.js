const prisma = require("../config/db");
const { AppError } = require("../lib/error");

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

module.exports = { listSuppliers, findSupplier, createSupplier, updateSupplier, setSupplierStatus };
