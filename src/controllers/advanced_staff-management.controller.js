const advanceService = require("../services/advanced_staff-management.service");
const { storedSlipPath } = require("../middleware/advancedStaffManagementUploads");

const respond = (handler, status = 200) => async (request, response, next) => {
  try { response.status(status).json({ data: await handler(request) }); } catch (error) { next(error); }
};

// Returns { page, limit } only when both are valid positive integers; otherwise null (full list).
const parsePagination = (query) => {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);
  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) return null;
  return { page, limit: Math.min(limit, 100) };
};

const parseAdvanceFilters = (query) => ({
  staffId: query.staffId || undefined,
  month:   query.month ? Number.parseInt(query.month, 10) : undefined,
  year:    query.year ? Number.parseInt(query.year, 10) : undefined,
});

const parseSlot = (query) => (query.slot === "additional" ? "additional" : "main");

const listAdvances = respond((request) => advanceService.listAdvances(request.auth.orgId, parseAdvanceFilters(request.query), parsePagination(request.query)));
const createAdvance = respond((request) => advanceService.createAdvance({ orgId: request.auth.orgId, memberId: request.auth.memberId, data: request.body }), 201);
const reviewAdvance = respond((request) => advanceService.reviewAdvance({ orgId: request.auth.orgId, memberId: request.auth.memberId, id: request.params.id, data: request.body }));
const requestAdditional = respond((request) => advanceService.requestAdditional({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const reviewAdditional = respond((request) => advanceService.reviewAdditional({ orgId: request.auth.orgId, memberId: request.auth.memberId, id: request.params.id, data: request.body }));
const submitTakenDate = respond((request) => advanceService.submitTakenDate({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const uploadSlip = respond((request) => advanceService.uploadSlip({
  orgId:   request.auth.orgId,
  id:      request.params.id,
  slot:    parseSlot(request.query),
  slipUrl: storedSlipPath(request.file),
}));

module.exports = { listAdvances, createAdvance, reviewAdvance, requestAdditional, reviewAdditional, submitTakenDate, uploadSlip };
