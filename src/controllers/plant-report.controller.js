const plantReportService = require("../services/plant-report.service");

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

const parseFilters = (query) => ({
  plantId: query.plantId || undefined,
  month: query.month ? Number.parseInt(query.month, 10) : undefined,
  year: query.year ? Number.parseInt(query.year, 10) : undefined,
});

const listReports = respond((request) =>
  plantReportService.listReports(request.auth.orgId, parseFilters(request.query), parsePagination(request.query)));

const getReport = respond((request) => plantReportService.findReport(request.auth.orgId, request.params.id));

const createReport = respond((request) => plantReportService.createReport({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  data: request.body,
}), 201);

const updateReport = respond((request) => plantReportService.updateReport({
  orgId: request.auth.orgId,
  id: request.params.id,
  data: request.body,
}));

const reviewReport = respond((request) => plantReportService.reviewReport({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  id: request.params.id,
}));

const deleteReport = respond((request) => plantReportService.deleteReport(request.auth.orgId, request.params.id));

const summary = respond((request) => plantReportService.summary(request.auth.orgId, {
  plantId: request.query.plantId || undefined,
  month: request.query.month ? Number.parseInt(request.query.month, 10) : undefined,
  year: Number.parseInt(request.query.year, 10),
  view: request.query.view || "monthly",
}));

module.exports = { listReports, getReport, createReport, updateReport, reviewReport, deleteReport, summary };
