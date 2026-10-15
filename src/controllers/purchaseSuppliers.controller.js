const suppliersService = require("../services/purchaseSuppliers.service");

const respond = (handler, status = 200) => async (request, response, next) => {
  try { response.status(status).json({ data: await handler(request) }); } catch (error) { next(error); }
};

const listSuppliers = respond((request) => suppliersService.listSuppliers(request.auth.orgId));
const getSupplier = respond((request) => suppliersService.findSupplier(request.auth.orgId, request.params.id));

// History tables page through 10 rows by default; limit is capped at 100.
const parsePagination = (query) => {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10,
  };
};

const listSupplierPurchases = respond((request) => suppliersService.listSupplierPurchases(request.auth.orgId, request.params.id, parsePagination(request.query)));
const listSupplierPayments = respond((request) => suppliersService.listSupplierPayments(request.auth.orgId, request.params.id, parsePagination(request.query)));
const createSupplier = respond((request) => suppliersService.createSupplier({ orgId: request.auth.orgId, memberId: request.auth.memberId, data: request.body }), 201);
const updateSupplier = respond((request) => suppliersService.updateSupplier({ orgId: request.auth.orgId, id: request.params.id, data: request.body }));
const setSupplierStatus = respond((request) => suppliersService.setSupplierStatus({ orgId: request.auth.orgId, id: request.params.id, isActive: request.body.isActive }));
const createSupplierPayment = respond((request) => suppliersService.createSupplierPayment({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  id: request.params.id,
  data: request.body,
  files: request.files,
}), 201);

module.exports = { listSuppliers, getSupplier, listSupplierPurchases, listSupplierPayments, createSupplier, updateSupplier, setSupplierStatus, createSupplierPayment };
