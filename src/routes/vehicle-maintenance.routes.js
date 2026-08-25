const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/vehicle-maintenance.controller");
const { voucherUploads, uploadErrorHandler } = require("../middleware/maintenanceUploads");
const {
  validateMaintenanceCreate,
  validateMaintenanceUpdate,
  validateMaintenanceReview,
} = require("../validator/vehicle-maintenance.validator");

const router = express.Router();

const requireReviewer = (request, _response, next) =>
  ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to review maintenance records."));

const requireDelete = (request, _response, next) =>
  request.auth.role === "ADMIN" ? next() : next(new AppError(403, "You do not have permission to delete maintenance records."));

router.use(authenticate);
router.get("/maintenance/stats", controller.stats);
router.get("/maintenance", controller.listMaintenance);
router.get("/maintenance/:id", controller.getMaintenance);
router.post("/maintenance", validateMaintenanceCreate, controller.createMaintenance);
router.patch("/maintenance/:id", validateMaintenanceUpdate, controller.updateMaintenance);
router.patch("/maintenance/:id/vouchers", voucherUploads, uploadErrorHandler, controller.uploadVouchers);
router.patch("/maintenance/:id/review", requireReviewer, validateMaintenanceReview, controller.reviewMaintenance);
router.delete("/maintenance/:id", requireDelete, controller.deleteMaintenance);

module.exports = router;
