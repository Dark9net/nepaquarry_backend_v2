const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/plant-report.controller");
const { validateReportCreate, validateReportUpdate } = require("../validator/plant-report.validator");

const router = express.Router();

const requireReviewer = (request, _response, next) =>
  ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to review reports."));

const requireDelete = (request, _response, next) =>
  request.auth.role === "ADMIN" ? next() : next(new AppError(403, "You do not have permission to delete reports."));

router.use(authenticate);
router.get("/plant/summary", controller.summary);
router.get("/plant", controller.listReports);
router.get("/plant/:id", controller.getReport);
router.post("/plant", validateReportCreate, controller.createReport);
router.patch("/plant/:id", validateReportUpdate, controller.updateReport);
router.post("/plant/:id/review", requireReviewer, controller.reviewReport);
router.delete("/plant/:id", requireDelete, controller.deleteReport);

module.exports = router;
