const suppliersService = require("../services/purchaseSuppliers.service");

const respond = (handler, status = 200) => async (request, response, next) => {
  try { response.status(status).json({ data: await handler(request) }); } catch (error) { next(error); }
};

const listSuppliers = respond((request) => suppliersService.listSuppliers(request.auth.orgId));
const getSupplier = respond((request) => suppliersService.findSupplier(request.auth.orgId, request.params.id));
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

module.exports = { listSuppliers, getSupplier, createSupplier, updateSupplier, setSupplierStatus, createSupplierPayment };
