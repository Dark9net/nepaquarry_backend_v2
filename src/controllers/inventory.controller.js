const inventoryService = require("../services/inventory.service");

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

const parseTransactionFilters = (query) => ({
  productId: query.productId || undefined,
  type:      query.type || undefined,
  date:      query.date || undefined,
  month:     query.month ? Number.parseInt(query.month, 10) : undefined,
  year:      query.year ? Number.parseInt(query.year, 10) : undefined,
});

const parseSummaryFilters = (query) => ({
  search:      query.search || undefined,
  reorderOnly: query.reorderOnly === "true",
  location:    query.location || undefined,
});

const listTransactions = respond((request) => inventoryService.listTransactions(request.auth.orgId, parseTransactionFilters(request.query), parsePagination(request.query)));
const createTransaction = respond((request) => inventoryService.createTransaction({ orgId: request.auth.orgId, memberId: request.auth.memberId, data: request.body }), 201);
const deleteTransaction = respond((request) => inventoryService.deleteTransaction({ orgId: request.auth.orgId, id: request.params.id }));
const getSummary = respond((request) => inventoryService.getInventorySummary(
  request.auth.orgId,
  request.query.date || undefined,
  parseSummaryFilters(request.query),
  parsePagination(request.query),
));

module.exports = { listTransactions, createTransaction, deleteTransaction, getSummary };
