const prisma = require("../config/db");
const { AppError } = require("../lib/error");

// ─── Calculation engine ───────────────────────────────────────
// calculatedRate  = roundToNearest50((basePrice / refVolume) x thisVolume)
// internalTaxable = calculatedRate / 1.13   (VAT-inclusive rate -> base amount, 2 d.p.)
// internalVat     = calculatedRate - internalTaxable (exact remainder, so taxable + vat === calculatedRate)
// internalTotal   = calculatedRate
// externalRate    = calculatedRate

// Rounds to the nearest "friendly" multiple of 50, based on where the value
// falls within its block of 100:
//   remainder 1-33  -> round down to the block floor   (e.g. 421 -> 400)
//   remainder 34-66 -> round to the block midpoint      (e.g. 452 -> 450)
//   remainder 67-99 -> round up to the next block floor (e.g. 478 -> 500)
const roundToNearest50 = (value) => {
  const rounded = Math.round(value);
  const remainder = ((rounded % 100) + 100) % 100;
  const base = rounded - remainder;

  if (remainder <= 33) return base;
  if (remainder <= 66) return base + 50;
  return base + 100;
};

const round2 = (value) => Math.round(value * 100) / 100;

const calcRate = (basePrice, refVolume, thisVolume) => {
  const calculatedRate = roundToNearest50((Number(basePrice) / Number(refVolume)) * Number(thisVolume));
  const internalTaxable = round2(calculatedRate / 1.13);
  const internalVat = round2(calculatedRate - internalTaxable);

  return {
    calculatedRate,
    internalTotal: calculatedRate,
    internalTaxable,
    internalVat,
    externalRate: calculatedRate,
  };
};

const notFound = (resource) => new AppError(404, `${resource} not found`);

const rateInclude = {
  material: { select: { id: true, name: true } },
  referenceVehicle: { select: { id: true, vehicleModel: true, volume: true } },
  setBy: { select: { id: true, user: { select: { name: true } } } },
  details: {
    include: {
      tripVehicle: { select: { id: true, vehicleModel: true, volume: true, isActive: true } },
    },
    orderBy: { tripVehicle: { vehicleModel: "asc" } },
  },
};

// ─── Trip Vehicles ────────────────────────────────────────────

const listTripVehicles = (orgId) =>
  prisma.tripVehicle.findMany({ where: { orgId }, orderBy: { vehicleModel: "asc" } });

const createTripVehicle = async (orgId, memberId, data) => {
  const exists = await prisma.tripVehicle.findUnique({
    where: { orgId_vehicleModel: { orgId, vehicleModel: data.vehicleModel } },
  });
  if (exists) throw new AppError(409, "A trip vehicle with this model name already exists.");

  return prisma.tripVehicle.create({
    data: { orgId, createdById: memberId, vehicleModel: data.vehicleModel, volume: data.volume },
  });
};

const updateTripVehicle = async (orgId, id, data) => {
  const vehicle = await prisma.tripVehicle.findFirst({ where: { id, orgId } });
  if (!vehicle) throw notFound("Trip vehicle");

  const updateData = {};
  if (data.vehicleModel !== undefined) updateData.vehicleModel = data.vehicleModel;
  if (data.volume !== undefined) updateData.volume = data.volume;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.tripVehicle.update({ where: { id }, data: updateData });
};

// ─── Rates ────────────────────────────────────────────────────

const listRates = async (orgId, filters, pagination) => {
  const where = { orgId };
  if (filters?.materialId) where.materialId = filters.materialId;

  const orderBy = [{ material: { name: "asc" } }];

  if (!pagination) {
    const data = await prisma.materialRate.findMany({ where, include: rateInclude, orderBy });
    return { success: true, data, total: data.length, page: 1, limit: data.length || 1, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.materialRate.count({ where }),
    prisma.materialRate.findMany({ where, include: rateInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);

  return { success: true, data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const previewRate = async (orgId, { referenceVehicleId, basePrice }) => {
  const refVehicle = await prisma.tripVehicle.findFirst({ where: { id: referenceVehicleId, orgId } });
  if (!refVehicle) throw notFound("Reference vehicle");

  const activeVehicles = await prisma.tripVehicle.findMany({
    where: { orgId, isActive: true },
    orderBy: { vehicleModel: "asc" },
  });

  return activeVehicles.map((vehicle) => ({
    tripVehicleId: vehicle.id,
    vehicleModel: vehicle.vehicleModel,
    volume: vehicle.volume,
    ...calcRate(basePrice, refVehicle.volume, vehicle.volume),
  }));
};

const setRate = async (orgId, memberId, { materialId, referenceVehicleId, basePrice }) => {
  const material = await prisma.rawMaterial.findFirst({ where: { id: materialId, orgId } });
  if (!material) throw new AppError(400, "Select a valid material.");

  const refVehicle = await prisma.tripVehicle.findFirst({ where: { id: referenceVehicleId, orgId } });
  if (!refVehicle) throw new AppError(400, "Select a valid reference vehicle.");

  const allVehicles = await prisma.tripVehicle.findMany({ where: { orgId, isActive: true } });

  const rateId = await prisma.$transaction(async (tx) => {
    const rate = await tx.materialRate.upsert({
      where: { orgId_materialId_referenceVehicleId: { orgId, materialId, referenceVehicleId } },
      create: { orgId, materialId, referenceVehicleId, basePrice, setById: memberId, setAt: new Date() },
      update: { basePrice, setById: memberId, setAt: new Date() },
    });

    for (const vehicle of allVehicles) {
      const calc = calcRate(basePrice, refVehicle.volume, vehicle.volume);

      await tx.materialRateDetail.upsert({
        where: { rateId_tripVehicleId: { rateId: rate.id, tripVehicleId: vehicle.id } },
        create: {
          orgId,
          rateId: rate.id,
          tripVehicleId: vehicle.id,
          ...calc,
          snapshotVolume: vehicle.volume,
          snapshotBasePrice: basePrice,
          snapshotRefVolume: refVehicle.volume,
          calculatedAt: new Date(),
        },
        update: {
          ...calc,
          snapshotVolume: vehicle.volume,
          snapshotBasePrice: basePrice,
          snapshotRefVolume: refVehicle.volume,
          calculatedAt: new Date(),
        },
      });
    }

    return rate.id;
  });

  return prisma.materialRate.findUnique({ where: { id: rateId }, include: rateInclude });
};

const recalculateRate = async (orgId, rateId) => {
  const rate = await prisma.materialRate.findFirst({
    where: { id: rateId, orgId },
    include: { referenceVehicle: true, details: { select: { tripVehicleId: true } } },
  });
  if (!rate) throw notFound("Rate");

  const allVehicles = await prisma.tripVehicle.findMany({ where: { orgId, isActive: true } });
  const existingIds = new Set(rate.details.map((detail) => detail.tripVehicleId));
  const missing = allVehicles.filter((vehicle) => !existingIds.has(vehicle.id));

  if (missing.length === 0) {
    return prisma.materialRate.findUnique({ where: { id: rateId }, include: rateInclude });
  }

  await prisma.$transaction(
    missing.map((vehicle) => {
      const calc = calcRate(rate.basePrice, rate.referenceVehicle.volume, vehicle.volume);
      return prisma.materialRateDetail.create({
        data: {
          orgId,
          rateId: rate.id,
          tripVehicleId: vehicle.id,
          ...calc,
          snapshotVolume: vehicle.volume,
          snapshotBasePrice: rate.basePrice,
          snapshotRefVolume: rate.referenceVehicle.volume,
          calculatedAt: new Date(),
        },
      });
    }),
  );

  return prisma.materialRate.findUnique({ where: { id: rateId }, include: rateInclude });
};

const deleteRate = async (orgId, rateId) => {
  const rate = await prisma.materialRate.findFirst({ where: { id: rateId, orgId } });
  if (!rate) throw notFound("Rate");

  await prisma.$transaction([
    prisma.materialRateDetail.deleteMany({ where: { rateId } }),
    prisma.materialRate.delete({ where: { id: rateId } }),
  ]);

  return { id: rateId };
};

module.exports = {
  listTripVehicles,
  createTripVehicle,
  updateTripVehicle,
  listRates,
  previewRate,
  setRate,
  recalculateRate,
  deleteRate,
};
