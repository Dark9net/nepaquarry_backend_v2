const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const { removeStoredFile } = require("../middleware/purchaseUploads");

const purchaseInclude = {
  createdBy:  { select: { id: true, user: { select: { name: true } } } },
  reviewedBy: { select: { id: true, user: { select: { name: true } } } },
  supplier:   { select: { id: true, name: true, contactNo: true, panNo: true, address: true } },
  payments: {
    orderBy: { createdAt: "asc" },
    include: { createdBy: { select: { id: true, user: { select: { name: true } } } } },
  },
};

const notFound = (resource) => new AppError(404, `${resource} not found`);

const asDate = (value) => new Date(`${value}T00:00:00.000Z`);

const nextSerialNo = async (tx, orgId) => {
  const last = await tx.purchase.findFirst({
    where: { orgId, serialNo: { startsWith: "PUR-" } },
    orderBy: { serialNo: "desc" },
    select: { serialNo: true },
  });

  const lastNumber = last ? Number.parseInt(last.serialNo.slice(4), 10) || 0 : 0;
  return `PUR-${String(lastNumber + 1).padStart(3, "0")}`;
};

const buildWhere = (orgId, { month, year, search }) => {
  const where = { orgId };
  if (month && year) {
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    where.purchaseDate = {
      gte: new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`),
      lte: new Date(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`),
    };
  } else if (year) {
    where.purchaseDate = { gte: new Date(`${year}-01-01T00:00:00.000Z`), lte: new Date(`${year}-12-31T23:59:59.999Z`) };
  }
  if (search) {
    // Supplier name and purchase detail are both searchable from the records
    // filter bar, so a term matching either one keeps the row.
    where.OR = [
      { partyName: { contains: search } },
      { particular: { contains: search } },
    ];
  }
  return where;
};

const listPurchases = async (orgId, filters, pagination) => {
  const where = buildWhere(orgId, filters);
  const orderBy = [{ purchaseDate: "desc" }, { createdAt: "desc" }];

  const summaryAgg = await prisma.purchase.aggregate({
    where,
    _sum: { amount: true },
  });
  const reviewedTotal = await prisma.purchase.count({ where: { ...where, status: "REVIEWED" } });
  const summary = {
    purchaseAmount: (summaryAgg._sum.amount || 0).toString(),
    reviewedTotal,
  };

  if (!pagination) {
    const data = await prisma.purchase.findMany({ where, include: purchaseInclude, orderBy });
    return { success: true, data, total: data.length, page: 1, limit: data.length || 1, totalPages: 1, summary };
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.purchase.count({ where }),
    prisma.purchase.findMany({ where, include: purchaseInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);

  return { success: true, data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)), summary };
};

const findPurchase = async (orgId, id) => {
  const purchase = await prisma.purchase.findFirst({ where: { id, orgId }, include: purchaseInclude });
  if (!purchase) throw notFound("Purchase");
  return purchase;
};

const assertSupplier = async (orgId, supplierId) => {
  if (!supplierId) return null;
  const supplier = await prisma.purchaseSupplier.findFirst({ where: { id: supplierId, orgId } });
  if (!supplier) throw new AppError(400, "Select a valid supplier account.");
  return supplier;
};

const createPurchase = async ({ orgId, memberId, data, files }) => {
  await assertSupplier(orgId, data.supplierId);

  const billFile = files?.billFile?.[0];
  if (!billFile) throw new AppError(400, "Bill upload is required.");
  const voucherFile = files?.voucherFile?.[0];

  const hasPayment = Boolean(data.paymentDate || data.paymentAmount || voucherFile);
  if (hasPayment) {
    if (!data.paymentDate) throw new AppError(400, "Payment date is required when payment is recorded.");
    if (!data.paymentAmount) throw new AppError(400, "Payment amount must be greater than zero.");
    if (!voucherFile) throw new AppError(400, "Voucher upload is required when payment is recorded.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const serialNo = await nextSerialNo(tx, orgId);

      const purchase = await tx.purchase.create({
        data: {
          orgId,
          createdById:   memberId,
          supplierId:    data.supplierId || null,
          serialNo,
          purchaseDate:  asDate(data.purchaseDate),
          partyName:     data.partyName,
          contactNo:     data.contactNo,
          panNo:         data.panNo,
          address:       data.address,
          particular:    data.particular,
          amount:        data.amount,
          billNo:        data.billNo,
          billFilePath:  `/uploads/purchase/${billFile.filename}`,
          paymentMethod: data.paymentMethod,
          paymentDate:   data.paymentDate ? asDate(data.paymentDate) : null,
          paymentAmount: data.paymentAmount ?? null,
          voucherPath:   voucherFile ? `/uploads/purchase/${voucherFile.filename}` : null,
        },
        include: purchaseInclude,
      });

      if (data.supplierId && data.paymentAmount) {
        await tx.purchaseSupplierPayment.create({
          data: {
            orgId,
            supplierId:    data.supplierId,
            purchaseId:    purchase.id,
            paymentDate:   asDate(data.paymentDate),
            amount:        data.paymentAmount,
            paymentMethod: data.paymentMethod,
            voucherPath:   voucherFile ? `/uploads/purchase/${voucherFile.filename}` : null,
            billPaths:     JSON.stringify([`/uploads/purchase/${billFile.filename}`]),
            voucherPaths:  voucherFile ? JSON.stringify([`/uploads/purchase/${voucherFile.filename}`]) : null,
            notes:         data.paymentNote,
            createdById:   memberId,
          },
        });
      }

      return findPurchaseTx(tx, orgId, purchase.id);
    });
  } catch (error) {
    removeStoredFile(`/uploads/purchase/${billFile.filename}`);
    if (voucherFile) removeStoredFile(`/uploads/purchase/${voucherFile.filename}`);
    throw error;
  }
};

const findPurchaseTx = async (tx, orgId, id) => {
  const purchase = await tx.purchase.findFirst({ where: { id, orgId }, include: purchaseInclude });
  if (!purchase) throw notFound("Purchase");
  return purchase;
};

const updatePurchase = async ({ orgId, memberId, id, data, files }) => {
  const existing = await findPurchase(orgId, id);
  if (existing.status === "REVIEWED") throw new AppError(400, "Reviewed purchases can no longer be edited.");

  await assertSupplier(orgId, data.supplierId);

  const billFile = files?.billFile?.[0];
  const voucherFile = files?.voucherFile?.[0];

  const hasPayment = Boolean(data.paymentDate || data.paymentAmount || voucherFile);
  if (hasPayment) {
    if (!data.paymentDate) throw new AppError(400, "Payment date is required when payment is recorded.");
    if (!data.paymentAmount) throw new AppError(400, "Payment amount must be greater than zero.");
    if (!voucherFile && !existing.voucherPath && !data.clearVoucher) throw new AppError(400, "Voucher upload is required when payment is recorded.");
  }

  // The purchase form's own payment lives twice: on the purchase row
  // (paymentAmount) and as a PurchaseSupplierPayment, which is what the
  // per-row due amount and the supplier balance are summed from. It is the
  // only payment carrying a single `voucherPath` — supplier-ledger payments
  // only ever set `voucherPaths` — so that is how it is told apart here.
  const initialPayment = existing.payments.find((payment) => payment.voucherPath) || null;
  const keepsPayment = hasPayment && Boolean(data.supplierId);
  const otherPaid = existing.payments
    .filter((payment) => payment !== initialPayment)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const newAmount = Number(data.amount);
  const newPaid = otherPaid + (keepsPayment ? Number(data.paymentAmount) : 0);
  if (newPaid > newAmount + 0.005) {
    throw new AppError(
      400,
      otherPaid > 0
        ? `Payments on this purchase would exceed its amount. Rs. ${otherPaid.toFixed(2)} has already been paid from the supplier ledger.`
        : "Payment amount cannot exceed the purchase amount.",
    );
  }

  const voucherPath = voucherFile
    ? `/uploads/purchase/${voucherFile.filename}`
    : (data.clearVoucher ? null : existing.voucherPath);
  const billFilePath = billFile ? `/uploads/purchase/${billFile.filename}` : existing.billFilePath;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.purchase.update({
        where: { id },
        data: {
          supplierId:    data.supplierId || null,
          purchaseDate:  asDate(data.purchaseDate),
          partyName:     data.partyName,
          contactNo:     data.contactNo,
          panNo:         data.panNo,
          address:       data.address,
          particular:    data.particular,
          amount:        data.amount,
          billNo:        data.billNo,
          billFilePath:  billFile ? `/uploads/purchase/${billFile.filename}` : undefined,
          paymentMethod: data.paymentMethod,
          paymentDate:   data.paymentDate ? asDate(data.paymentDate) : null,
          paymentAmount: data.paymentAmount ?? null,
          voucherPath:   voucherFile ? `/uploads/purchase/${voucherFile.filename}` : (data.clearVoucher ? null : undefined),
        },
      });

      // Keep the matching payment record in step, so the due amount is
      // recalculated from the edited figures.
      if (keepsPayment) {
        const paymentData = {
          supplierId:    data.supplierId,
          paymentDate:   asDate(data.paymentDate),
          amount:        data.paymentAmount,
          paymentMethod: data.paymentMethod,
          voucherPath,
          voucherPaths:  voucherPath ? JSON.stringify([voucherPath]) : null,
          billPaths:     billFilePath ? JSON.stringify([billFilePath]) : null,
          notes:         data.paymentNote ?? null,
        };
        if (initialPayment) {
          await tx.purchaseSupplierPayment.update({ where: { id: initialPayment.id }, data: paymentData });
        } else {
          await tx.purchaseSupplierPayment.create({
            data: { ...paymentData, orgId, purchaseId: id, createdById: memberId },
          });
        }
      } else if (initialPayment) {
        // Payment removed from the purchase, so its record goes too.
        await tx.purchaseSupplierPayment.delete({ where: { id: initialPayment.id } });
      }

      return findPurchaseTx(tx, orgId, id);
    });

    if (billFile && existing.billFilePath) removeStoredFile(existing.billFilePath);
    if (voucherFile && existing.voucherPath) removeStoredFile(existing.voucherPath);
    if (data.clearVoucher && !voucherFile && existing.voucherPath) removeStoredFile(existing.voucherPath);

    return updated;
  } catch (error) {
    if (billFile) removeStoredFile(`/uploads/purchase/${billFile.filename}`);
    if (voucherFile) removeStoredFile(`/uploads/purchase/${voucherFile.filename}`);
    throw error;
  }
};

const reviewPurchase = async ({ orgId, memberId, id, data }) => {
  const purchase = await findPurchase(orgId, id);
  if (purchase.status === "REVIEWED") throw new AppError(400, "This purchase has already been reviewed.");

  return prisma.purchase.update({
    where: { id },
    data: {
      status:       "REVIEWED",
      reviewedById: memberId,
      reviewedAt:   new Date(),
      reviewNote:   data.reviewNote,
    },
    include: purchaseInclude,
  });
};

module.exports = { listPurchases, createPurchase, updatePurchase, reviewPurchase };
