const leaveService = require("../services/staff-management.service");
const { storedSlipPath } = require("../middleware/staffManagementUploads");

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

const parseLeaveFilters = (query) => ({
  staffId: query.staffId || undefined,
  status:  query.status || undefined,
  month:   query.month ? Number.parseInt(query.month, 10) : undefined,
  year:    query.year ? Number.parseInt(query.year, 10) : undefined,
});

const listLeaves = respond((request) => leaveService.listLeaves(request.auth.orgId, parseLeaveFilters(request.query), parsePagination(request.query)));
const createLeave = respond((request) => leaveService.createLeave({ orgId: request.auth.orgId, memberId: request.auth.memberId, data: request.body }), 201);
const reviewLeave = respond((request) => leaveService.reviewLeave({ orgId: request.auth.orgId, memberId: request.auth.memberId, id: request.params.id, data: request.body }));
const deleteLeave = respond((request) => leaveService.deleteLeave({ orgId: request.auth.orgId, id: request.params.id }));
const uploadLeaveSlip = respond((request) => leaveService.uploadLeaveSlip({ orgId: request.auth.orgId, id: request.params.id, slipUrl: storedSlipPath(request.file) }));

module.exports = { listLeaves, createLeave, reviewLeave, deleteLeave, uploadLeaveSlip };
