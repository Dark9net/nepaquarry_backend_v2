const tripService = require("../services/raw-material-trip-entry.service");

const respond = (handler, status = 200) => async (request, response, next) => {
  try {
    const result = await handler(request);
    if (result && typeof result === "object" && "success" in result) {
      response.status(status).json(result);
      return;
    }
    response.status(status).json({ data: result });
  } catch (error) {
    next(error);
  }
};

// Returns { page, limit } only when both are valid positive integers; otherwise null (full list).
const parsePagination = (query) => {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);
  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) return null;
  return { page, limit: Math.min(limit, 100) };
};

const parseMonthlyFilters = (query) => ({
  month: query.month ? Number.parseInt(query.month, 10) : undefined,
  year: query.year ? Number.parseInt(query.year, 10) : undefined,
  materialId: query.materialId || undefined,
});

const listDayTrips = respond((request) =>
  tripService.listDayTrips(request.auth.orgId, request.params.date, parsePagination(request.query)));

const listMonthlyRecords = respond((request) =>
  tripService.listMonthlyRecords(request.auth.orgId, parseMonthlyFilters(request.query), parsePagination(request.query)));

const monthlySummary = respond(async (request) => {
  const filters = parseMonthlyFilters(request.query);
  const summary = await tripService.monthlySummary(request.auth.orgId, filters);

  const byDatePagination = parsePagination({ page: request.query.datePage, limit: request.query.dateLimit });
  const byDriverPagination = parsePagination({ page: request.query.driverPage, limit: request.query.driverLimit });

  const byDate = tripService.paginateArray(summary.byDate, byDatePagination);
  const byDriver = tripService.paginateArray(summary.byDriver, byDriverPagination);

  return {
    success: true,
    grandTotal: summary.grandTotal,
    driverCount: summary.driverCount,
    recordCount: summary.recordCount,
    byDate,
    byDriver,
    records: summary.records,
  };
});

const upsertTrip = respond((request) => tripService.upsertTrip({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  data: request.body,
}), 201);

const deleteTrip = respond((request) => tripService.deleteTrip(request.auth.orgId, request.params.id));

module.exports = { listDayTrips, listMonthlyRecords, monthlySummary, upsertTrip, deleteTrip };
