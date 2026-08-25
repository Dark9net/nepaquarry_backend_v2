const rateService = require("../services/rate-management.service");

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

const listTripVehicles = respond((request) => rateService.listTripVehicles(request.auth.orgId));

const createTripVehicle = respond((request) =>
  rateService.createTripVehicle(request.auth.orgId, request.auth.memberId, request.body), 201);

const updateTripVehicle = respond((request) =>
  rateService.updateTripVehicle(request.auth.orgId, request.params.id, request.body));

const listRates = respond((request) =>
  rateService.listRates(
    request.auth.orgId,
    { materialId: request.query.materialId || undefined },
    parsePagination(request.query),
  ));

const previewRate = respond((request) => rateService.previewRate(request.auth.orgId, request.body));

const setRate = respond((request) =>
  rateService.setRate(request.auth.orgId, request.auth.memberId, request.body));

const recalculateRate = respond((request) =>
  rateService.recalculateRate(request.auth.orgId, request.params.rateId));

const deleteRate = respond((request) => rateService.deleteRate(request.auth.orgId, request.params.rateId));

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
