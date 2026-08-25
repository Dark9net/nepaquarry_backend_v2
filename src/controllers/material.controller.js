const materialService = require("../services/material.service");

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

const listMaterials = respond((request) =>
  materialService.listMaterials(
    request.auth.orgId,
    parsePagination(request.query),
    typeof request.query.search === "string" ? request.query.search.trim() : undefined,
  ));

const createMaterial = respond((request) => materialService.createMaterial({
  orgId: request.auth.orgId, memberId: request.auth.memberId, data: request.body,
}), 201);

const updateMaterial = respond((request) => materialService.updateMaterial({
  orgId: request.auth.orgId, id: request.params.id, data: request.body,
}));

module.exports = { listMaterials, createMaterial, updateMaterial };
