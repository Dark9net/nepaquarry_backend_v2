const vehicleService = require("../services/vehicle.service");

const respond = (handler, status = 200) => async (request, response, next) => {
  try { response.status(status).json({ data: await handler(request) }); } catch (error) { next(error); }
};

const listVehicles = respond((request) => vehicleService.listVehicles(request.auth.orgId));
const createVehicle = respond((request) => vehicleService.createVehicle({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  data: request.body,
}), 201);
const updateVehicle = respond((request) => vehicleService.updateVehicle({
  orgId: request.auth.orgId,
  id: request.params.id,
  data: request.body,
}));

module.exports = { listVehicles, createVehicle, updateVehicle };
