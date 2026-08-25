const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/vehicle.controller");
const { validateVehicleCreate, validateVehicleUpdate } = require("../validator/vehicle.validator");

const router = express.Router();
const requireWrite = (request, _response, next) =>
  ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to manage vehicles."));

router.use(authenticate);
router.get("/vehicles", controller.listVehicles);
router.post("/vehicles", requireWrite, validateVehicleCreate, controller.createVehicle);
router.patch("/vehicles/:id", requireWrite, validateVehicleUpdate, controller.updateVehicle);

module.exports = router;
