const ordersService = require("../services/orders.service");

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

const parseFilters = (query) => ({
  status: query.status || undefined,
  month:  query.month ? Number.parseInt(query.month, 10) : undefined,
  year:   query.year ? Number.parseInt(query.year, 10) : undefined,
});

const listOrders = respond((request) => ordersService.listOrders(request.auth.orgId, parseFilters(request.query), parsePagination(request.query)));
const getOrderStats = respond((request) => ordersService.getOrderStats(request.auth.orgId, parseFilters(request.query)));
const createOrder = respond((request) => ordersService.createOrder({ orgId: request.auth.orgId, memberId: request.auth.memberId, data: request.body }), 201);
const markInformed = respond((request) => ordersService.markInformed({ orgId: request.auth.orgId, id: request.params.id }));
const markProcurementReceived = respond((request) => ordersService.markProcurementReceived({ orgId: request.auth.orgId, memberId: request.auth.memberId, id: request.params.id }));
const markOrderSent = respond((request) => ordersService.markOrderSent({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const markReceived = respond((request) => ordersService.markReceived({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const requestClarification = respond((request) => ordersService.requestClarification({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const rejectOrder = respond((request) => ordersService.rejectOrder({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const cancelOrder = respond((request) => ordersService.cancelOrder({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const verifyOrder = respond((request) => ordersService.verifyOrder({ orgId: request.auth.orgId, memberId: request.auth.memberId, id: request.params.id }));
const deleteOrder = respond((request) => ordersService.deleteOrder({ orgId: request.auth.orgId, id: request.params.id }));

module.exports = {
  listOrders, getOrderStats, createOrder, markInformed, markProcurementReceived,
  markOrderSent, markReceived, requestClarification, rejectOrder,
  cancelOrder, verifyOrder, deleteOrder,
};
