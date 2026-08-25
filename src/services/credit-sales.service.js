const prisma = require("../config/db");
const { AppError } = require("../lib/error");
const { Decimal } = require("decimal.js");
const { formatNepaliDate } = require("../utils/nepaliDate");

const notFoundParty = () => new AppError(404, "Credit party not found");
const notFoundRate = () => new AppError(404, "Rate not found");
const notFoundTxn = () => new AppError(404, "Credit transaction not found");

const partyInclude = {
  createdBy: { select: { id: true, user: { select: { name: true } } } },
  rates: {
    include: {
      tripVehicle: { select: { id: true, vehicleModel: true, volume: true } },
      material: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  },
  _count: { select: { transactions: true } },
};

const transactionInclude = {
  creditParty: { select: { id: true, name: true, creditBalance: true } },
  tripVehicle: { select: { id: true, vehicleModel: true, volume: true } },
  material: { select: { id: true, name: true } },
  report: { select: { id: true, billNumber: true, status: true } },
  createdBy: { select: { id: true, user: { select: { name: true } } } },
};

// ─── Parties ────────────────────────────────────────────────

const listParties = (orgId, includeInactive) =>
  prisma.creditParty.findMany({
    where: { orgId, ...(includeInactive ? {} : { isActive: true }) },
    include: partyInclude,
    orderBy: { name: "asc" },
  });

const findParty = async (orgId, id) => {
  const party = await prisma.creditParty.findFirst({ where: { id, orgId }, include: partyInclude });
  if (!party) throw notFoundParty();
  return party;
};

const getPartyBalances = async (orgId) => {
  const parties = await prisma.creditParty.findMany({
    where: { orgId, isActive: true },
    include: { transactions: { select: { amount: true } } },
    orderBy: { name: "asc" },
  });

  return parties.map((party) => {
    const usedAmount = party.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const creditBalance = Number(party.creditBalance);
    return {
      id: party.id,
      name: party.name,
      balanceType: party.balanceType,
      creditBalance,
      usedAmount,
      remainingBalance: creditBalance - usedAmount,
    };
  });
};

const assertUniqueName = async (orgId, name, excludeId) => {
  const existing = await prisma.creditParty.findFirst({
    where: { orgId, name, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  if (existing) throw new AppError(400, "A credit party with this name already exists.");
};

const createParty = async (orgId, memberId, data) => {
  await assertUniqueName(orgId, data.name);

  return prisma.creditParty.create({
    data: {
      orgId,
      createdById: memberId,
      name: data.name,
      balanceType: data.balanceType || "CREDIT",
      creditBalance: new Decimal(data.creditBalance),
      panNo: data.panNo || null,
      address: data.address || null,
      contactPerson: data.contactPerson || null,
      contactNo: data.contactNo || null,
      notes: data.notes || null,
    },
    include: partyInclude,
  });
};

const updateParty = async (orgId, id, data) => {
  await findParty(orgId, id);
  if (data.name !== undefined) await assertUniqueName(orgId, data.name, id);

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.balanceType !== undefined) updateData.balanceType = data.balanceType;
  if (data.creditBalance !== undefined) updateData.creditBalance = new Decimal(data.creditBalance);
  if (data.panNo !== undefined) updateData.panNo = data.panNo || null;
  if (data.address !== undefined) updateData.address = data.address || null;
  if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson || null;
  if (data.contactNo !== undefined) updateData.contactNo = data.contactNo || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  if (data.topupAmount !== undefined) {
    const party = await prisma.creditParty.findUnique({ where: { id } });
    updateData.creditBalance = new Decimal(party.creditBalance).plus(new Decimal(data.topupAmount));
  }

  return prisma.creditParty.update({ where: { id }, data: updateData, include: partyInclude });
};

const deleteParty = async (orgId, id) => {
  const party = await prisma.creditParty.findFirst({ where: { id, orgId }, include: { _count: { select: { transactions: true } } } });
  if (!party) throw notFoundParty();
  if (party._count.transactions > 0) {
    throw new AppError(400, "Cannot delete a party that has recorded transactions. Deactivate it instead.");
  }

  await prisma.$transaction([
    prisma.creditPartyRate.deleteMany({ where: { creditPartyId: id } }),
    prisma.creditParty.delete({ where: { id } }),
  ]);
  return { id };
};

// ─── Rates ──────────────────────────────────────────────────

const upsertRate = async (orgId, partyId, data) => {
  await findParty(orgId, partyId);

  const material = await prisma.rawMaterial.findFirst({ where: { id: data.materialId, orgId } });
  if (!material) throw new AppError(400, "Select a valid material.");

  const vehicle = await prisma.tripVehicle.findFirst({ where: { id: data.tripVehicleId, orgId } });
  if (!vehicle) throw new AppError(400, "Select a valid vehicle.");

  return prisma.creditPartyRate.upsert({
    where: {
      creditPartyId_tripVehicleId_materialId: {
        creditPartyId: partyId,
        tripVehicleId: data.tripVehicleId,
        materialId: data.materialId,
      },
    },
    create: {
      creditPartyId: partyId,
      tripVehicleId: data.tripVehicleId,
      materialId: data.materialId,
      ratePerTrip: new Decimal(data.ratePerTrip),
    },
    update: {
      ratePerTrip: new Decimal(data.ratePerTrip),
    },
    include: {
      tripVehicle: { select: { id: true, vehicleModel: true, volume: true } },
      material: { select: { id: true, name: true } },
    },
  });
};

const deleteRate = async (orgId, rateId) => {
  const rate = await prisma.creditPartyRate.findFirst({
    where: { id: rateId, creditParty: { orgId } },
  });
  if (!rate) throw notFoundRate();

  await prisma.creditPartyRate.delete({ where: { id: rateId } });
  return { id: rateId };
};

// ─── Transactions ───────────────────────────────────────────

const listTransactions = async (orgId, filters) => {
  const where = { orgId };
  if (filters.creditPartyId) where.creditPartyId = filters.creditPartyId;

  if (filters.date) {
    const [y, m, d] = filters.date.split("-").map(Number);
    where.date = new Date(Date.UTC(y, m - 1, d));
  } else if (filters.month && filters.year) {
    where.date = {
      gte: new Date(Date.UTC(filters.year, filters.month - 1, 1)),
      lte: new Date(Date.UTC(filters.year, filters.month, 0)),
    };
  } else if (filters.year) {
    where.date = {
      gte: new Date(Date.UTC(filters.year, 0, 1)),
      lte: new Date(Date.UTC(filters.year, 11, 31)),
    };
  }

  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;

  const [data, total] = await Promise.all([
    prisma.creditTransaction.findMany({
      where,
      include: transactionInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.creditTransaction.count({ where }),
  ]);

  return {
    success: true,
    data: data.map((t) => ({ ...t, nepaliDate: formatNepaliDate(new Date(t.date)) })),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

const createTransaction = async (orgId, memberId, input) => {
  const party = await prisma.creditParty.findFirst({ where: { id: input.creditPartyId, orgId } });
  if (!party) throw notFoundParty();
  if (!party.isActive) throw new AppError(400, "This credit party is inactive.");

  const material = await prisma.rawMaterial.findFirst({ where: { id: input.materialId, orgId } });
  if (!material) throw new AppError(400, "Select a valid material.");

  const vehicle = await prisma.tripVehicle.findFirst({ where: { id: input.tripVehicleId, orgId } });
  if (!vehicle) throw new AppError(400, "Select a valid vehicle.");

  const [y, m, d] = input.date.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  const rateUsed = new Decimal(input.rateUsed);
  const amount = rateUsed.mul(input.trips);

  return prisma.creditTransaction.create({
    data: {
      orgId,
      creditPartyId: input.creditPartyId,
      date,
      tripVehicleId: input.tripVehicleId,
      materialId: input.materialId,
      trips: input.trips,
      rateUsed,
      amount,
      billNo: input.billNo || null,
      notes: input.notes || null,
      createdById: memberId,
    },
    include: transactionInclude,
  }).then((t) => ({ ...t, nepaliDate: formatNepaliDate(new Date(t.date)) }));
};

const deleteTransaction = async (orgId, id) => {
  const txn = await prisma.creditTransaction.findFirst({ where: { id, orgId } });
  if (!txn) throw notFoundTxn();
  if (txn.reportId) throw new AppError(400, "This transaction is already linked to a submitted report and cannot be deleted.");

  await prisma.creditTransaction.delete({ where: { id } });
  return { id };
};

module.exports = {
  listParties,
  findParty,
  getPartyBalances,
  createParty,
  updateParty,
  deleteParty,
  upsertRate,
  deleteRate,
  listTransactions,
  createTransaction,
  deleteTransaction,
};
