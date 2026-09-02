const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/maintenanceshop.controller");
const { shopPaymentVoucherUploads, uploadErrorHandler } = require("../middleware/maintenanceUploads");
const {
  validateShop,
  validateShopStatus,
  validatePayment,
} = require("../validator/maintenanceshop.validator");

const router = express.Router();

const requireManage = (request, _response, next) =>
  ["ADMIN", "SUPERVISOR"].includes(request.auth.role)
    ? next()
    : next(new AppError(403, "You do not have permission to manage maintenance shops."));

// Recording a payment against a shop is day-to-day operational work, so
// employees may do it. Creating or editing the shops themselves stays with
// ADMIN/SUPERVISOR via `requireManage` above.
const requireRecordPayment = (request, _response, next) =>
  ["ADMIN", "SUPERVISOR", "EMPLOYEE"].includes(request.auth.role)
    ? next()
    : next(new AppError(403, "You do not have permission to record maintenance payments."));

router.use(authenticate);

router.get("/maintenance-shops", controller.listShops);
router.get("/maintenance-shops/:id", controller.getShop);
router.post("/maintenance-shops", requireManage, validateShop, controller.createShop);
router.put("/maintenance-shops/:id", requireManage, validateShop, controller.updateShop);
router.patch("/maintenance-shops/:id/status", requireManage, validateShopStatus, controller.setShopStatus);

router.get("/maintenance-shop-payments", controller.listPayments);
router.post(
  "/maintenance-shop-payments",
  requireRecordPayment,
  shopPaymentVoucherUploads,
  uploadErrorHandler,
  validatePayment,
  controller.createPayment,
);
router.put("/maintenance-shop-payments/:id", requireRecordPayment, validatePayment, controller.updatePayment);
router.delete("/maintenance-shop-payments/:id", requireManage, controller.deletePayment);

module.exports = router;
