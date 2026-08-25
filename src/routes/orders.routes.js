const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/orders.controller");
const {
  validateOrderCreate, validateStatusRemark,
  validateOrderSent, validateReceived,
} = require("../validator/orders.validator");

const router = express.Router();

const requireRole = (...roles) => (request, _response, next) =>
  roles.includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to perform this action."));

// Requesting an order: everyone except GUEST and PROCUREMENT.
const requireCreate = requireRole("ADMIN", "SUPERVISOR", "EMPLOYEE");
// Informing procurement of a request: EMPLOYEE only, matching the frontend's canInformOrder.
const requireInform = requireRole("EMPLOYEE");
// Procurement-side actions: PROCUREMENT plus ADMIN/SUPERVISOR oversight.
const requireProcure = requireRole("ADMIN", "SUPERVISOR", "PROCUREMENT");
const requireSend = requireRole("PROCUREMENT");
const requireReceive = requireRole("EMPLOYEE");
const requireVerify = requireRole("ADMIN", "SUPERVISOR");
// Cancel is available to both the requesting employee and the procurement side.
const requireCancel = requireRole("ADMIN", "SUPERVISOR", "PROCUREMENT", "EMPLOYEE");

router.use(authenticate);
router.get("/orders", controller.listOrders);
router.get("/orders/stats", controller.getOrderStats);
router.post("/orders", requireCreate, validateOrderCreate, controller.createOrder);
router.patch("/orders/:id/inform", requireInform, controller.markInformed);
router.patch("/orders/:id/procurement-receive", requireProcure, controller.markProcurementReceived);
router.patch("/orders/:id/order-sent", requireSend, validateOrderSent, controller.markOrderSent);
router.patch("/orders/:id/receive", requireReceive, validateReceived, controller.markReceived);
router.patch("/orders/:id/clarification", requireProcure, validateStatusRemark, controller.requestClarification);
router.patch("/orders/:id/reject", requireProcure, validateStatusRemark, controller.rejectOrder);
router.patch("/orders/:id/cancel", requireCancel, validateStatusRemark, controller.cancelOrder);
router.patch("/orders/:id/verify", requireVerify, controller.verifyOrder);
router.delete("/orders/:id", controller.deleteOrder);

module.exports = router;
