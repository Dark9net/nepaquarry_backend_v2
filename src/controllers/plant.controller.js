const plantService = require("../services/plant.service");

const respond = (handler, status = 200) => async (request, response, next) => {
  try { response.status(status).json({ data: await handler(request) }); } catch (error) { next(error); }
};

const listPlants = respond((request) => plantService.listPlants(request.auth.orgId));
const createPlant = respond((request) => plantService.createPlant({
  orgId: request.auth.orgId,
  memberId: request.auth.memberId,
  data: request.body,
}), 201);
const updatePlant = respond((request) => plantService.updatePlant({
  orgId: request.auth.orgId,
  id: request.params.id,
  data: request.body,
}));

module.exports = { listPlants, createPlant, updatePlant };
