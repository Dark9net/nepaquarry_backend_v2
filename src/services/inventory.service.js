const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const productSelect = {
  id: true, productCode: true, name: true,
  category: true, location: true, serialNo: true, reorderLevel: true,
  supplierAName: true, supplierARate: true,
  supplierBName: true, supplierBRate: true,
  supplierCName: true, supplierCRate: true,
  photo1: true, photo2: true, photo3: true,
};

const transactionInclude = {
  product:   { select: productSelect },
  createdBy: { select: { id: true, user: { select: { name: true } } } },
};

const notFound = (resource) => new AppError(404, `${resource} not found`);

const assertActiveProduct = async (orgId, productId) => {
  const product = await prisma.masterProduct.findFirst({ where: { id: productId, orgId, isActive: true } });
  if (!product) throw new AppError(400, "Select an active product in your organization.");
  return product;
};

const buildTransactionWhere = (orgId, { productId, type, date, month, year }) => {
  const where = { orgId };
  if (productId) where.productId = productId;
  if (type) where.type = type;

  if (date) {
    where.date = {
      gte: new Date(`${date}T00:00:00.000Z`),
      lte: new Date(`${date}T23:59:59.999Z`),
    };
  } else if (month && year) {
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    where.date = {
      gte: new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`),
      lte: new Date(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`),
    };
  }

  return where;
};

const listTransactions = async (orgId, filters, pagination) => {
  const where = buildTransactionWhere(orgId, filters);
  const orderBy = [{ date: "desc" }, { createdAt: "desc" }];

  if (!pagination) {
    return prisma.inventoryTransaction.findMany({ where, include: transactionInclude, orderBy });
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.inventoryTransaction.count({ where }),
    prisma.inventoryTransaction.findMany({ where, include: transactionInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);
  return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const createTransaction = async ({ orgId, memberId, data }) => {
  await assertActiveProduct(orgId, data.productId);

  return prisma.inventoryTransaction.create({
    data: {
      orgId,
      productId:   data.productId,
      type:        data.type,
      quantity:    data.quantity,
      date:        new Date(`${data.date}T00:00:00.000Z`),
      remarks:     data.remarks,
      createdById: memberId,
    },
    include: transactionInclude,
  });
};

const deleteTransaction = async ({ orgId, id }) => {
  const transaction = await prisma.inventoryTransaction.findFirst({ where: { id, orgId } });
  if (!transaction) throw notFound("Transaction");

  await prisma.inventoryTransaction.delete({ where: { id } });
  return { id };
};

const matchesSummarySearch = (row, search) => {
  if (!search) return true;
  const query = search.toLowerCase();
  return [row.name, row.productCode, row.category, row.location, row.serialNo, row.supplierAName, row.supplierBName, row.supplierCName]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
};

// ─── Inventory summary (opening/closing balance as of a given date) ──────
// Balances require scanning every active product's transactions, so the full
// summary is always computed server-side; search/reorder/location filters and
// pagination are applied afterwards so the response still returns only a page.
const getInventorySummary = async (orgId, dateStr, filters = {}, pagination) => {
  const { search, reorderOnly, location } = filters;
  const targetDateStr = dateStr || new Date().toISOString().split("T")[0];
  const todayStart = new Date(`${targetDateStr}T00:00:00.000Z`);
  const todayEnd = new Date(`${targetDateStr}T23:59:59.999Z`);
  const yesterdayEnd = new Date(todayStart.getTime() - 1);

  const paginate = (rows) => {
    if (!pagination) return { data: rows };
    const { page, limit } = pagination;
    const total = rows.length;
    return {
      data: rows.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  };

  const products = await prisma.masterProduct.findMany({
    where: { orgId, isActive: true },
    select: productSelect,
    orderBy: { name: "asc" },
  });
  if (products.length === 0) return { ...paginate([]), reorderLocations: [], reorderCount: 0, productCount: 0 };

  const productIds = products.map((product) => product.id);

  const [openingTx, todayTx] = await prisma.$transaction([
    prisma.inventoryTransaction.groupBy({
      by: ["productId", "type"],
      where: { orgId, productId: { in: productIds }, date: { lte: yesterdayEnd } },
      _sum: { quantity: true },
    }),
    prisma.inventoryTransaction.groupBy({
      by: ["productId", "type"],
      where: { orgId, productId: { in: productIds }, date: { gte: todayStart, lte: todayEnd } },
      _sum: { quantity: true },
    }),
  ]);

  const buildTotals = (rows) => {
    const totals = {};
    productIds.forEach((id) => { totals[id] = { in: 0, out: 0 }; });
    rows.forEach((row) => {
      const bucket = totals[row.productId] ?? (totals[row.productId] = { in: 0, out: 0 });
      if (row.type === "IN") bucket.in += row._sum.quantity || 0;
      if (row.type === "OUT") bucket.out += row._sum.quantity || 0;
    });
    return totals;
  };

  const openingTotals = buildTotals(openingTx);
  const todayTotals = buildTotals(todayTx);

  const rows = products.map((product) => {
    const opening = openingTotals[product.id].in - openingTotals[product.id].out;
    const todayIn = todayTotals[product.id].in;
    const todayOut = todayTotals[product.id].out;
    const closing = opening + todayIn - todayOut;

    return {
      productId: product.id,
      productCode: product.productCode,
      name: product.name,
      category: product.category,
      location: product.location,
      serialNo: product.serialNo,
      reorderLevel: product.reorderLevel,
      supplierAName: product.supplierAName,
      supplierARate: product.supplierARate,
      supplierBName: product.supplierBName,
      supplierBRate: product.supplierBRate,
      supplierCName: product.supplierCName,
      supplierCRate: product.supplierCRate,
      photo1: product.photo1,
      photo2: product.photo2,
      photo3: product.photo3,
      openingBalance: opening,
      todayIn,
      todayOut,
      closingBalance: closing,
      reorderRequired: closing <= product.reorderLevel,
    };
  });

  const filtered = rows
    .filter((row) => (reorderOnly ? row.reorderRequired : true))
    .filter((row) => (location ? row.location === location : true))
    .filter((row) => matchesSummarySearch(row, search));

  const reorderLocations = [...new Set(rows.filter((row) => row.reorderRequired).map((row) => row.location).filter(Boolean))].sort();
  const reorderCount = rows.filter((row) => row.reorderRequired).length;

  return { ...paginate(filtered), reorderLocations, reorderCount, productCount: rows.length };
};

module.exports = { listTransactions, createTransaction, deleteTransaction, getInventorySummary };
