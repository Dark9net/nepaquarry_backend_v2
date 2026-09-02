const purchaseService = require("../services/purchase.service");

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
  month: query.month ? Number.parseInt(query.month, 10) : undefined,
  year:  query.year ? Number.parseInt(query.year, 10) : undefined,
  search: query.search ? String(query.search).trim() || undefined : undefined,
});

const listPurchases = respond((request) => purchaseService.listPurchases(request.auth.orgId, parseFilters(request.query), parsePagination(request.query)));

const createPurchase = respond((request) => purchaseService.createPurchase({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  data: request.body,
  files: request.files,
}), 201);

const updatePurchase = respond((request) => purchaseService.updatePurchase({
  orgId: request.auth.orgId,
  id: request.params.id,
  data: request.body,
  files: request.files,
}));

const reviewPurchase = respond((request) => purchaseService.reviewPurchase({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  id: request.params.id,
  data: request.body,
}));

module.exports = { listPurchases, createPurchase, updatePurchase, reviewPurchase };
