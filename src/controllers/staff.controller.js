const staffService = require("../services/staff.service");
const { storedPhotoPaths } = require("../middleware/staffUploads");

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

const listDepartments = respond((request) => staffService.listDepartments(request.auth.orgId, request.query.all === "true", parsePagination(request.query)));
const createDepartment = respond((request) => staffService.createDepartment({ orgId: request.auth.orgId, data: request.body }), 201);
const updateDepartment = respond((request) => staffService.updateDepartment({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const listStaff = respond((request) => staffService.listStaff(request.auth.orgId, parsePagination(request.query)));
const createStaff = respond((request) => staffService.createStaff({ orgId: request.auth.orgId, memberId: request.auth.memberId, data: request.body, photos: storedPhotoPaths(request.files) }), 201);
const updateStaff = respond((request) => staffService.updateStaff({ orgId: request.auth.orgId, id: request.params.id, data: request.body, photos: storedPhotoPaths(request.files) }));
const deactivateStaff = respond((request) => staffService.deactivateStaff({ orgId: request.auth.orgId, id: request.params.id }));
module.exports = { listDepartments, createDepartment, updateDepartment, listStaff, createStaff, updateStaff, deactivateStaff };
