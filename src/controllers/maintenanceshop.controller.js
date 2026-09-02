const shopsService = require("../services/maintenanceshop.service");

const respond = (handler, status = 200) => async (request, response, next) => {
  try { response.status(status).json({ data: await handler(request) }); } catch (error) { next(error); }
};

// Returns { page, limit } only when both are valid positive integers;
// otherwise null, which makes the service return the full list.
const parsePagination = (query) => {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);
  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) return null;
  return { page, limit: Math.min(limit, 100) };
};

// The list endpoint returns the page envelope alongside `data`, so the client
// gets `total` / `totalPages` without a second request.
const listShops = async (request, response, next) => {
  try {
    const { data, ...meta } = await shopsService.listShops(request.auth.orgId, {
      search: request.query.search,
      pagination: parsePagination(request.query),
    });
    response.status(200).json({ data, ...meta });
  } catch (error) {
    next(error);
  }
};
const getShop = respond((request) => shopsService.findShop(request.auth.orgId, request.params.id));
const createShop = respond((request) => shopsService.createShop({ orgId: request.auth.orgId, memberId: request.auth.memberId, data: request.body }), 201);
const updateShop = respond((request) => shopsService.updateShop({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const setShopStatus = respond((request) => shopsService.setShopStatus({ orgId: request.auth.orgId, id: request.params.id, isActive: request.body.isActive }));

const listPayments = respond((request) => shopsService.listPayments(request.auth.orgId, { shopId: request.query.shopId }));
const createPayment = respond((request) => shopsService.createPayment({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  data: request.body,
  voucherFiles: request.files,
}), 201);
const updatePayment = respond((request) => shopsService.updatePayment({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const deletePayment = respond((request) => shopsService.deletePayment({ orgId: request.auth.orgId, id: request.params.id }));

module.exports = {
  listShops,
  getShop,
  createShop,
  updateShop,
  setShopStatus,
  listPayments,
  createPayment,
  updatePayment,
  deletePayment,
};
