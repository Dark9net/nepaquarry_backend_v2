const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const controller = require("../controllers/sales.controller");
const {
  validateCreateReport,
  validateCreateSaleEntry,
  validateListReportsQuery,
  validateInitReportQuery,
  validateSummaryQuery,
} = require("../validator/sales.validator");

const router = express.Router();

router.use(authenticate);

router.get("/sales/init", validateInitReportQuery, controller.initReport);
router.get("/sales/summary", validateSummaryQuery, controller.getSummary);
router.post("/sales/sale-entries", validateCreateSaleEntry, controller.createSaleEntry);
router.delete("/sales/sale-entries/:id", controller.deleteSaleEntry);

// Declared before "/sales/:id" so "manual-expenses" is not swallowed as an id.
router.get("/sales/manual-expenses", controller.listManualExpenses);
router.get("/sales", validateListReportsQuery, controller.listReports);
router.post("/sales", validateCreateReport, controller.createReport);
router.get("/sales/:id", controller.getReport);
router.get("/sales/:id/download-pdf", controller.downloadReportPdf);
router.post("/sales/:id/approve", controller.approveReport);

module.exports = router;
