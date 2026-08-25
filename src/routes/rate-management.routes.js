const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/rate-management.controller");
const {
  validateTripVehicleCreate,
  validateTripVehicleUpdate,
  validatePreviewRate,
  validateSetRate,
} = require("../validator/rate-management.validator");

const router = express.Router();

const requireAdmin = (request, _response, next) =>
  request.auth.role === "ADMIN" ? next() : next(new AppError(403, "You do not have permission to manage rates."));

router.use(authenticate);

// Trip vehicles — all roles can read (needed for dropdowns elsewhere), ADMIN only can write
router.get("/rates/trip-vehicles", controller.listTripVehicles);
router.post("/rates/trip-vehicles", requireAdmin, validateTripVehicleCreate, controller.createTripVehicle);
router.patch("/rates/trip-vehicles/:id", requireAdmin, validateTripVehicleUpdate, controller.updateTripVehicle);

// Rates — all roles can read, ADMIN only can write
router.get("/rates", controller.listRates);
router.post("/rates/preview", requireAdmin, validatePreviewRate, controller.previewRate);
router.post("/rates", requireAdmin, validateSetRate, controller.setRate);
router.post("/rates/:rateId/recalculate", requireAdmin, controller.recalculateRate);
router.delete("/rates/:rateId", requireAdmin, controller.deleteRate);

module.exports = router;
