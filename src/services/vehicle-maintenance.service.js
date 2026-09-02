const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const {
  storedBillPath,
  removeStoredBillFile,
  storedShopPaymentVoucherPaths,
  removeStoredShopPaymentVoucherFile,
} = require("../middleware/maintenanceUploads");

const maintenanceInclude = {
  vehicle: { select: { id: true, VehicleModel: true, vehicleNo: true } },
  plant: { select: { id: true, name: true, location: true } },
  shop: { select: { id: true, name: true, contactNo: true } },
  driverStaff: { select: { id: true, fullName: true, employeeCode: true } },
  createdBy: { select: { id: true, user: { select: { name: true } } } },
  reviewedBy: { select: { id: true, user: { select: { name: true } } } },
  items: true,
};

const notFound = (resource) => new AppError(404, `${resource} not found`);

const asDate = (value) => (value ? new Date(`${value}T00:00:00.000Z`) : null);

const monthRange = (month, year) => {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    gte: new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`),
    lte: new Date(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`),
  };
};

const itemAmount = (item) => (item.quantity || 0) * Number(item.unitCost || 0);

const itemsWithTotals = (items = []) => items.map((item) => ({
  itemName: item.itemName,
  partSerialNo: item.partSerialNo ?? null,
  quantity: item.quantity ?? null,
  unitCost: item.unitCost ?? null,
  totalCost: itemAmount(item),
}));

const sumTotal = (items = []) => items.reduce((sum, item) => sum + itemAmount(item), 0);

const buildWhere = (orgId, { month, year, vehicleId, plantId, status, paymentStatus }) => {
  const where = { orgId };
  if (month && year) where.maintenanceDate = monthRange(month, year);
  else if (year) where.maintenanceDate = { gte: new Date(`${year}-01-01T00:00:00.000Z`), lte: new Date(`${year}-12-31T23:59:59.999Z`) };
  if (vehicleId) where.vehicleId = vehicleId;
  if (plantId) where.plantId = plantId;
  if (status) where.status = status;

  if (paymentStatus === "UNPAID") where.paymentDate = null;
  else if (paymentStatus === "VOUCHER_PENDING") { where.paymentDate = { not: null }; where.voucherPhotos = null; }
  else if (paymentStatus === "PAID") { where.paymentDate = { not: null }; where.voucherPhotos = { not: null }; }

  return where;
};

const serialize = (record) => ({
  ...record,
  totalCost: Number(record.totalCost),
  voucherPhotos: record.voucherPhotos ? JSON.parse(record.voucherPhotos) : [],
  items: record.items.map((item) => ({ ...item, totalCost: Number(item.totalCost), unitCost: item.unitCost == null ? null : Number(item.unitCost) })),
});

const listMaintenance = async (orgId, filters, pagination) => {
  const where = buildWhere(orgId, filters);
  const orderBy = [{ maintenanceDate: "desc" }, { createdAt: "desc" }];

  if (!pagination) {
    const data = await prisma.vehicleMaintenance.findMany({ where, include: maintenanceInclude, orderBy });
    const serialized = data.map(serialize);
    return { success: true, data: serialized, total: serialized.length, page: 1, limit: serialized.length || 1, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.vehicleMaintenance.count({ where }),
    prisma.vehicleMaintenance.findMany({ where, include: maintenanceInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);

  return { success: true, data: data.map(serialize), total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const findMaintenance = async (orgId, id) => {
  const record = await prisma.vehicleMaintenance.findFirst({ where: { id, orgId }, include: maintenanceInclude });
  if (!record) throw notFound("Maintenance record");
  return serialize(record);
};

const assertAsset = async (orgId, { vehicleId, plantId, shopId }) => {
  if (vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, orgId } });
    if (!vehicle) throw new AppError(400, "Select a valid vehicle.");
  }
  if (plantId) {
    const plant = await prisma.plant.findFirst({ where: { id: plantId, orgId } });
    if (!plant) throw new AppError(400, "Select a valid plant.");
  }
  if (shopId) {
    const shop = await prisma.maintenanceShop.findFirst({ where: { id: shopId, orgId } });
    if (!shop) throw new AppError(400, "Select a valid maintenance shop.");
  }
};

/*
 * `initialPaymentDate`/`initialPaymentAmount` are deliberately separate from
 * `paymentDate` above (the job's own "bill settled" date, which drives the
 * Daily Sales expense and unlocks voucher-photo upload — see uploadVouchers
 * below). This one only ever creates a MaintenanceShopPayment ledger row
 * against the shop, mirroring how createPurchase optionally creates a
 * PurchaseSupplierPayment alongside the purchase itself — it never touches
 * the job's own paymentDate/voucherPhotos fields.
 */
const createMaintenance = async ({ orgId, memberId, data, files }) => {
  await assertAsset(orgId, data);

  const totalCost = sumTotal(data.items);
  const billFile = files?.billFile?.[0];
  const voucherFile = files?.voucherFile?.[0];
  if (!billFile) throw new AppError(400, "Bill upload is required.");

  // Mirrors maintenanceshop.service.js#cheque — a cheque payment carries its
  // value in initialChequeAmount (the client disables the plain amount field
  // in that mode) and is mirrored into paidamount below so the maintenance
  // record's outstanding due treats it exactly like cash.
  const isInitialCheque = data.initialPaymentMethod === "CHEQUE";
  const initialPaidAmount = isInitialCheque ? data.initialChequeAmount : data.initialPaymentAmount;
  const hasInitialPayment = Boolean(data.initialPaymentDate || data.initialPaymentAmount || data.initialChequeAmount || voucherFile);
  if (hasInitialPayment) {
    if (!data.initialPaymentDate) throw new AppError(400, "Payment date is required when recording an initial payment.");
    if (isInitialCheque) {
      if (!data.initialChequeAmount) throw new AppError(400, "Cheque amount must be greater than zero.");
      if (!data.initialChequeDetail) throw new AppError(400, "Enter the cheque detail.");
    } else if (!data.initialPaymentAmount) {
      throw new AppError(400, "Payment amount must be greater than zero.");
    }
    if (initialPaidAmount > totalCost) throw new AppError(400, "Payment amount cannot exceed the maintenance total.");
    if (!voucherFile) throw new AppError(400, "Voucher upload is required when recording a payment.");
  }

  const billFilePath = billFile ? storedBillPath(billFile) : null;
  const voucherFilePath = voucherFile ? storedShopPaymentVoucherPaths([voucherFile])[0] : null;

  try {
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.vehicleMaintenance.create({
        data: {
          orgId,
          vehicleId: data.vehicleId ?? null,
          plantId: data.plantId ?? null,
          shopId: data.shopId,
          driverStaffId: data.driverStaffId ?? null,
          maintenanceDate: asDate(data.maintenanceDate),
          paymentDate: asDate(data.paymentDate),
          paymentMethod: data.paymentMethod,
          odometer: data.odometer ?? null,
          nextServiceDate: asDate(data.nextServiceDate),
          notes: data.notes ?? null,
          billPath: billFilePath,
          totalCost,
          createdById: memberId,
          items: { create: itemsWithTotals(data.items) },
        },
        include: maintenanceInclude,
      });

      if (hasInitialPayment) {
        await tx.maintenanceShopPayment.create({
          data: {
            orgId,
            shopId: data.shopId,
            maintenanceId: created.id,
            paymentDate: asDate(data.initialPaymentDate),
            paidamount: initialPaidAmount,
            remainingamount: Number((totalCost - initialPaidAmount).toFixed(2)),
            paymentMethod: data.initialPaymentMethod,
            chequedetail: isInitialCheque ? data.initialChequeDetail : null,
            chequeamount: isInitialCheque ? data.initialChequeAmount : null,
            voucherPaths: JSON.stringify([voucherFilePath]),
            createdById: memberId,
          },
        });
      }

      return created;
    });

    return serialize(record);
  } catch (error) {
    if (billFilePath) removeStoredBillFile(billFilePath);
    if (voucherFilePath) removeStoredShopPaymentVoucherFile(voucherFilePath);
    throw error;
  }
};

const updateMaintenance = async ({ orgId, id, data }) => {
  const existing = await prisma.vehicleMaintenance.findFirst({ where: { id, orgId } });
  if (!existing) throw notFound("Maintenance record");
  await assertAsset(orgId, data);

  const updateData = {};
  if (data.vehicleId !== undefined) updateData.vehicleId = data.vehicleId;
  if (data.plantId !== undefined) updateData.plantId = data.plantId;
  if (data.shopId !== undefined) updateData.shopId = data.shopId;
  if (data.driverStaffId !== undefined) updateData.driverStaffId = data.driverStaffId;
  if (data.maintenanceDate !== undefined) updateData.maintenanceDate = asDate(data.maintenanceDate);
  if (data.paymentDate !== undefined) updateData.paymentDate = asDate(data.paymentDate);
  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
  if (data.odometer !== undefined) updateData.odometer = data.odometer;
  if (data.nextServiceDate !== undefined) updateData.nextServiceDate = asDate(data.nextServiceDate);
  if (data.notes !== undefined) updateData.notes = data.notes;

  // Clearing payment date also clears voucher photos (frontend confirms this with the user first).
  if (data.paymentDate === null) updateData.voucherPhotos = null;

  const record = await prisma.$transaction(async (tx) => {
    if (data.items !== undefined) {
      await tx.maintenanceItem.deleteMany({ where: { maintenanceId: id } });
      updateData.items = { create: itemsWithTotals(data.items) };
      updateData.totalCost = sumTotal(data.items);
    }

    return tx.vehicleMaintenance.update({ where: { id }, data: updateData, include: maintenanceInclude });
  });

  return serialize(record);
};

// Mirrors the multer limit in middleware/maintenanceUploads.js and
// MAX_PHOTOS on the frontend picker.
const MAX_VOUCHER_PHOTOS = 5;

const uploadVouchers = async ({ orgId, id, keepPhotos, newPhotoPaths }) => {
  const existing = await prisma.vehicleMaintenance.findFirst({ where: { id, orgId } });
  if (!existing) throw notFound("Maintenance record");
  if (!existing.paymentDate) throw new AppError(400, "Set a payment date before uploading voucher photos.");

  // Multer caps how many files arrive in one request, but the total is
  // kept + new, so without this a record could accumulate past the limit
  // over several uploads.
  const photos = [...keepPhotos, ...newPhotoPaths];
  if (photos.length > MAX_VOUCHER_PHOTOS) {
    throw new AppError(
      400,
      `A maintenance record can hold at most ${MAX_VOUCHER_PHOTOS} voucher photos.`,
    );
  }

  const record = await prisma.vehicleMaintenance.update({
    where: { id },
    data: { voucherPhotos: photos.length ? JSON.stringify(photos) : null },
    include: maintenanceInclude,
  });

  return serialize(record);
};

/*
 * Uploads (or replaces, or clears) the shop's bill/invoice for this job.
 * Kept as its own endpoint rather than a field on create/update, the same
 * way voucher photos are — the record can exist before the paper bill is in
 * hand, and a re-upload here doesn't need to touch the rest of the form.
 */
const uploadBill = async ({ orgId, id, billFilePath, clearBill }) => {
  const existing = await prisma.vehicleMaintenance.findFirst({ where: { id, orgId } });
  if (!existing) throw notFound("Maintenance record");

  if ((billFilePath || clearBill) && existing.billPath) removeStoredBillFile(existing.billPath);

  const record = await prisma.vehicleMaintenance.update({
    where: { id },
    data: { billPath: billFilePath ?? (clearBill ? null : undefined) },
    include: maintenanceInclude,
  });

  return serialize(record);
};

const reviewMaintenance = async ({ orgId, memberId, id, reviewNote }) => {
  const existing = await prisma.vehicleMaintenance.findFirst({ where: { id, orgId } });
  if (!existing) throw notFound("Maintenance record");
  if (existing.status === "REVIEWED") throw new AppError(400, "This record has already been reviewed.");

  const record = await prisma.vehicleMaintenance.update({
    where: { id },
    data: { status: "REVIEWED", reviewedById: memberId, reviewedAt: new Date(), reviewNote: reviewNote ?? null },
    include: maintenanceInclude,
  });

  return serialize(record);
};

const deleteMaintenance = async (orgId, id) => {
  const existing = await prisma.vehicleMaintenance.findFirst({ where: { id, orgId } });
  if (!existing) throw notFound("Maintenance record");
  await prisma.vehicleMaintenance.delete({ where: { id } });
  return { id };
};

const stats = async (orgId, { month, year }) => {
  const where = buildWhere(orgId, { month, year });
  const records = await prisma.vehicleMaintenance.findMany({
    where,
    select: { totalCost: true, paymentDate: true, voucherPhotos: true, status: true },
  });

  const totalRecords = records.length;
  const totalCost = records.reduce((sum, record) => sum + Number(record.totalCost), 0);
  const unpaid = records.filter((record) => !record.paymentDate).length;
  const voucherDone = records.filter((record) => record.paymentDate && record.voucherPhotos).length;
  const reviewed = records.filter((record) => record.status === "REVIEWED").length;

  return { totalRecords, totalCost, unpaid, voucherDone, reviewed };
};

module.exports = {
  listMaintenance,
  findMaintenance,
  createMaintenance,
  updateMaintenance,
  uploadVouchers,
  uploadBill,
  reviewMaintenance,
  deleteMaintenance,
  stats,
};
