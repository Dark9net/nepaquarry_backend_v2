const prisma = require("../config/db");
const { AppError } = require("../lib/error");

const reportInclude = {
  plant: { select: { id: true, name: true, location: true } },
  createdBy: { select: { id: true, user: { select: { name: true } } } },
  checkedBy: { select: { id: true, user: { select: { name: true } } } },
  components: true,
};

const notFound = (resource) => new AppError(404, `${resource} not found`);

const asDate = (value) => new Date(`${value}T00:00:00.000Z`);

// Plant start/stop times are wall-clock readings taken on site, not instants on
// a global timeline. A zoneless string like "2026-08-16T08:30:00" would be read
// by `new Date()` in the *server's* local zone and stored shifted (08:30 becomes
// 02:45 on a UTC server in Asia/Kathmandu), so we pin it to UTC instead. The
// client reads these back with the UTC getters, making the round trip exact
// regardless of where the server or the browser happens to be.
const asDateTime = (value) => {
  if (!value) return null;

  const zoneless = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(:\d{2})?$/.exec(value);
  if (zoneless) {
    const [, date, hhmm, seconds] = zoneless;
    return new Date(`${date}T${hhmm}${seconds || ":00"}.000Z`);
  }

  // Already carries an explicit offset (or is a Date) — trust it as an instant.
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const monthRange = (month, year) => {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    gte: new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`),
    lte: new Date(`${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`),
  };
};

const buildWhere = (orgId, { plantId, month, year }) => {
  const where = { orgId };
  if (plantId) where.plantId = plantId;
  if (month && year) where.date = monthRange(month, year);
  else if (year) where.date = { gte: new Date(`${year}-01-01T00:00:00.000Z`), lte: new Date(`${year}-12-31T23:59:59.999Z`) };
  return where;
};

const listReports = async (orgId, filters, pagination) => {
  const where = buildWhere(orgId, filters);
  const orderBy = [{ date: "desc" }, { createdAt: "desc" }];

  if (!pagination) {
    const data = await prisma.dailyPlantReport.findMany({ where, include: reportInclude, orderBy });
    return { success: true, data, total: data.length, page: 1, limit: data.length || 1, totalPages: 1 };
  }

  const { page, limit } = pagination;
  const [total, data] = await prisma.$transaction([
    prisma.dailyPlantReport.count({ where }),
    prisma.dailyPlantReport.findMany({ where, include: reportInclude, orderBy, skip: (page - 1) * limit, take: limit }),
  ]);

  return { success: true, data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
};

const findReport = async (orgId, id) => {
  const report = await prisma.dailyPlantReport.findFirst({ where: { id, orgId }, include: reportInclude });
  if (!report) throw notFound("Plant report");
  return report;
};

const assertPlant = async (orgId, plantId) => {
  const plant = await prisma.plant.findFirst({ where: { id: plantId, orgId } });
  if (!plant) throw new AppError(400, "Select a valid plant.");
  return plant;
};

const createReport = async ({ orgId, memberId, data }) => {
  await assertPlant(orgId, data.plantId);

  try {
    const report = await prisma.dailyPlantReport.create({
      data: {
        orgId,
        plantId: data.plantId,
        date: asDate(data.date),
        status: data.status,
        plantStartTime: asDateTime(data.plantStartTime),
        plantStopTime: asDateTime(data.plantStopTime),
        plantWorkingHours: data.plantWorkingHours ?? null,
        maintenanceDescription: data.maintenanceDescription ?? null,
        maintenanceStartTime: asDateTime(data.maintenanceStartTime),
        maintenanceEndTime: asDateTime(data.maintenanceEndTime),
        maintenanceHours: data.maintenanceHours ?? null,
        remarks: data.remarks ?? null,
        createdById: memberId,
        components: {
          create: data.components.map((component) => ({
            name: component.name,
            details: component.details ?? null,
            serialNo: component.serialNo ?? null,
          })),
        },
      },
      include: reportInclude,
    });
    return report;
  } catch (error) {
    if (error.code === "P2002") throw new AppError(400, "A report for this plant and date already exists.");
    throw error;
  }
};

const updateReport = async ({ orgId, id, data }) => {
  const existing = await findReport(orgId, id);

  // A reviewed report is a signed-off record: editing it would silently
  // change figures a supervisor already approved. Enforced here rather than
  // only by hiding the button, since the endpoint is reachable directly.
  if (existing.checkedAt) {
    throw new AppError(400, "This report has been reviewed and can no longer be edited.");
  }

  const updateData = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.plantStartTime !== undefined) updateData.plantStartTime = asDateTime(data.plantStartTime);
  if (data.plantStopTime !== undefined) updateData.plantStopTime = asDateTime(data.plantStopTime);
  if (data.plantWorkingHours !== undefined) updateData.plantWorkingHours = data.plantWorkingHours;
  if (data.maintenanceDescription !== undefined) updateData.maintenanceDescription = data.maintenanceDescription;
  if (data.maintenanceStartTime !== undefined) updateData.maintenanceStartTime = asDateTime(data.maintenanceStartTime);
  if (data.maintenanceEndTime !== undefined) updateData.maintenanceEndTime = asDateTime(data.maintenanceEndTime);
  if (data.maintenanceHours !== undefined) updateData.maintenanceHours = data.maintenanceHours;
  if (data.remarks !== undefined) updateData.remarks = data.remarks;

  return prisma.$transaction(async (tx) => {
    if (data.components !== undefined) {
      await tx.plantMaintenanceComponent.deleteMany({ where: { reportId: existing.id } });
      updateData.components = {
        create: data.components.map((component) => ({
          name: component.name,
          details: component.details ?? null,
          serialNo: component.serialNo ?? null,
        })),
      };
    }

    return tx.dailyPlantReport.update({ where: { id }, data: updateData, include: reportInclude });
  });
};

const reviewReport = async ({ orgId, memberId, id }) => {
  const existing = await findReport(orgId, id);
  if (existing.checkedAt) throw new AppError(400, "This report has already been reviewed.");

  return prisma.dailyPlantReport.update({
    where: { id },
    data: { checkedById: memberId, checkedAt: new Date() },
    include: reportInclude,
  });
};

const deleteReport = async (orgId, id) => {
  await findReport(orgId, id);
  await prisma.dailyPlantReport.delete({ where: { id } });
  return { id };
};

// ── Summary ──────────────────────────────────────────────────────

const isoWeekKey = (date) => {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((target - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

const periodKey = (view, date) => {
  if (view === "daily") return date.toISOString().slice(0, 10);
  if (view === "weekly") return isoWeekKey(date);
  if (view === "monthly") return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  return String(date.getUTCFullYear());
};

const buildSummaryWhere = (orgId, { plantId, month, year, view }) => {
  const where = { orgId };
  if (plantId) where.plantId = plantId;

  if (view === "yearly") {
    // no date bound — spans all years for multi-year comparison
  } else if (view === "daily" && month && year) {
    where.date = monthRange(month, year);
  } else if (year) {
    where.date = { gte: new Date(`${year}-01-01T00:00:00.000Z`), lte: new Date(`${year}-12-31T23:59:59.999Z`) };
  }

  return where;
};

const summary = async (orgId, filters) => {
  const { view } = filters;
  const where = buildSummaryWhere(orgId, filters);

  const reports = await prisma.dailyPlantReport.findMany({
    where,
    select: {
      id: true,
      date: true,
      status: true,
      plantId: true,
      plantWorkingHours: true,
      maintenanceHours: true,
      plant: { select: { id: true, name: true } },
    },
  });

  const periods = new Map();

  reports.forEach((report) => {
    const key = periodKey(view, report.date);
    if (!periods.has(key)) {
      periods.set(key, {
        key,
        runningHours: 0,
        maintenanceHours: 0,
        runningDays: 0,
        maintenanceDays: 0,
        totalDays: 0,
        byPlant: new Map(),
      });
    }

    const period = periods.get(key);
    const runningHours = Number(report.plantWorkingHours || 0);
    const maintenanceHours = Number(report.maintenanceHours || 0);
    const isRunning = report.status === "RUNNING" || report.status === "RUNNING_AND_MAINTENANCE";
    const isMaintenance = report.status === "MAINTENANCE" || report.status === "RUNNING_AND_MAINTENANCE";

    period.runningHours += runningHours;
    period.maintenanceHours += maintenanceHours;
    if (isRunning) period.runningDays += 1;
    if (isMaintenance) period.maintenanceDays += 1;
    period.totalDays += 1;

    if (!period.byPlant.has(report.plantId)) {
      period.byPlant.set(report.plantId, {
        plantId: report.plantId,
        plantName: report.plant?.name || "-",
        runningHours: 0,
        maintenanceHours: 0,
        days: 0,
      });
    }
    const plantBucket = period.byPlant.get(report.plantId);
    plantBucket.runningHours += runningHours;
    plantBucket.maintenanceHours += maintenanceHours;
    plantBucket.days += 1;
  });

  const periodList = Array.from(periods.values())
    .map((period) => ({ ...period, byPlant: Array.from(period.byPlant.values()) }))
    .sort((a, b) => a.key.localeCompare(b.key));

  const totals = periodList.reduce(
    (accumulator, period) => ({
      runningHours: accumulator.runningHours + period.runningHours,
      maintenanceHours: accumulator.maintenanceHours + period.maintenanceHours,
      totalReports: accumulator.totalReports + period.totalDays,
      runningDays: accumulator.runningDays + period.runningDays,
      maintenanceDays: accumulator.maintenanceDays + period.maintenanceDays,
    }),
    { runningHours: 0, maintenanceHours: 0, totalReports: 0, runningDays: 0, maintenanceDays: 0 },
  );

  return { periods: periodList, totals, reportCount: reports.length };
};

module.exports = {
  listReports,
  findReport,
  createReport,
  updateReport,
  reviewReport,
  deleteReport,
  summary,
};
