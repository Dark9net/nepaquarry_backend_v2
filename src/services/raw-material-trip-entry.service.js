const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const HOUR_LABEL = {
  0: "12am", 1: "1am", 2: "2am", 3: "3am", 4: "4am", 5: "5am",
  6: "6am", 7: "7am", 8: "8am", 9: "9am", 10: "10am", 11: "11am",
  12: "12pm", 13: "1pm", 14: "2pm", 15: "3pm", 16: "4pm", 17: "5pm",
  18: "6pm", 19: "7pm", 20: "8pm", 21: "9pm", 22: "10pm", 23: "11pm",
};

const LABEL_TO_HOUR = Object.fromEntries(
  Object.entries(HOUR_LABEL).map(([hour, label]) => [`t${label}`, Number(hour)]),
);

const tripInclude = {
  staff: { select: { id: true, fullName: true, employeeCode: true } },
  material: { select: { id: true, name: true } },
  createdBy: { select: { id: true, user: { select: { name: true } } } },
  tripEntries: { select: { hour: true, tripCount: true } },
};

const notFound = (resource) => new AppError(404, `${resource} not found`);

const asDate = (value) => new Date(`${value}T00:00:00.000Z`);

const monthRange = (month, year) => {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    gte: new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`),
    lte: new Date(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`),
  };
};

const listDayTrips = async (orgId, date, pagination) => {
  const where = { orgId, date: asDate(date) };
  const orderBy = [{ createdAt: "asc" }];

  if (!pagination) {
    const data = await prisma.dailyTripRecord.findMany({ where, include: tripInclude, orderBy });
    return { success: true, data, total: data.length, page: 1, limit: data.length || 1, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.dailyTripRecord.count({ where }),
    prisma.dailyTripRecord.findMany({ where, include: tripInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);

  return { success: true, data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const buildMonthlyWhere = (orgId, { month, year, materialId }) => {
  const where = { orgId };
  if (month && year) where.date = monthRange(month, year);
  if (materialId) where.materialId = materialId;
  return where;
};

const listMonthlyRecords = async (orgId, filters, pagination) => {
  const where = buildMonthlyWhere(orgId, filters);
  const orderBy = [{ date: "desc" }, { createdAt: "desc" }];

  if (!pagination) {
    const data = await prisma.dailyTripRecord.findMany({ where, include: tripInclude, orderBy });
    return { success: true, data, total: data.length, page: 1, limit: data.length || 1, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.dailyTripRecord.count({ where }),
    prisma.dailyTripRecord.findMany({ where, include: tripInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);

  return { success: true, data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const monthlySummary = async (orgId, filters) => {
  const where = buildMonthlyWhere(orgId, filters);

  const records = await prisma.dailyTripRecord.findMany({
    where,
    select: {
      id: true,
      date: true,
      dailyTotal: true,
      staffId: true,
      materialId: true,
      staff: { select: { id: true, fullName: true, employeeCode: true } },
      material: { select: { id: true, name: true } },
    },
  });

  const grandTotal = records.reduce((sum, record) => sum + record.dailyTotal, 0);

  const byDateMap = new Map();
  const byDriverMap = new Map();

  records.forEach((record) => {
    const dateKey = record.date.toISOString().slice(0, 10);
    byDateMap.set(dateKey, (byDateMap.get(dateKey) || 0) + record.dailyTotal);

    const driverKey = record.staffId;
    const existing = byDriverMap.get(driverKey) || {
      staffId: driverKey,
      name: record.staff?.fullName || "-",
      employeeCode: record.staff?.employeeCode || "-",
      total: 0,
      byDate: {},
    };
    existing.total += record.dailyTotal;
    existing.byDate[dateKey] = (existing.byDate[dateKey] || 0) + record.dailyTotal;
    byDriverMap.set(driverKey, existing);
  });

  const byDate = Array.from(byDateMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const byDriver = Array.from(byDriverMap.values()).sort((a, b) => b.total - a.total);

  const flatRecords = records.map((record) => ({
    id: record.id,
    date: record.date.toISOString().slice(0, 10),
    dailyTotal: record.dailyTotal,
    materialId: record.materialId,
    material: record.material,
  }));

  return { grandTotal, driverCount: byDriver.length, recordCount: records.length, byDate, byDriver, records: flatRecords };
};

const paginateArray = (items, pagination) => {
  if (!pagination) return { data: items, total: items.length, page: 1, limit: items.length || 1, totalPages: 1 };
  const { page, limit } = pagination;
  const total = items.length;
  const start = (page - 1) * limit;
  return { data: items.slice(start, start + limit), total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const findExisting = (orgId, date, staffId) =>
  prisma.dailyTripRecord.findFirst({ where: { orgId, date: asDate(date), staffId } });

const upsertTrip = async ({ orgId, memberId, data }) => {
  const staff = await prisma.staff.findFirst({ where: { id: data.staffId, orgId } });
  if (!staff) throw new AppError(400, "Select a valid driver.");

  if (data.materialId) {
    const material = await prisma.rawMaterial.findFirst({ where: { id: data.materialId, orgId } });
    if (!material) throw new AppError(400, "Select a valid material.");
  }

  const entries = Object.entries(data.hours)
    .map(([key, value]) => ({ hour: LABEL_TO_HOUR[key], tripCount: Number(value) || 0 }))
    .filter((entry) => Number.isInteger(entry.hour));

  if (entries.length === 0) throw new AppError(400, "Please add at least one hour.");

  const dailyTotal = entries.reduce((sum, entry) => sum + entry.tripCount, 0);
  const existing = await findExisting(orgId, data.date, data.staffId);

  return prisma.$transaction(async (tx) => {
    let record;

    if (existing) {
      await tx.rawMaterialTrip.deleteMany({ where: { tripRecordId: existing.id } });
      record = await tx.dailyTripRecord.update({
        where: { id: existing.id },
        data: {
          materialId: data.materialId || null,
          dailyTotal,
          updatedById: memberId,
          tripEntries: { create: entries },
        },
        include: tripInclude,
      });
    } else {
      record = await tx.dailyTripRecord.create({
        data: {
          orgId,
          date: asDate(data.date),
          staffId: data.staffId,
          materialId: data.materialId || null,
          createdById: memberId,
          dailyTotal,
          tripEntries: { create: entries },
        },
        include: tripInclude,
      });
    }

    return record;
  });
};

const deleteTrip = async (orgId, id) => {
  const existing = await prisma.dailyTripRecord.findFirst({ where: { id, orgId } });
  if (!existing) throw notFound("Trip record");
  await prisma.dailyTripRecord.delete({ where: { id } });
  return { id };
};

module.exports = {
  HOUR_LABEL,
  listDayTrips,
  listMonthlyRecords,
  monthlySummary,
  paginateArray,
  upsertTrip,
  deleteTrip,
};
