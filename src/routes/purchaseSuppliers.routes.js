const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/purchaseSuppliers.controller");
const { validateSupplier, validateSupplierStatus } = require("../validator/purchaseSuppliers.validator");

const router = express.Router();

const requireManage = (request, _response, next) =>
  ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to manage suppliers."));

router.use(authenticate);
router.get("/purchase-suppliers", controller.listSuppliers);
router.get("/purchase-suppliers/:id", controller.getSupplier);
router.post("/purchase-suppliers", requireManage, validateSupplier, controller.createSupplier);
router.put("/purchase-suppliers/:id", requireManage, validateSupplier, controller.updateSupplier);
router.patch("/purchase-suppliers/:id/status", requireManage, validateSupplierStatus, controller.setSupplierStatus);

module.exports = router;
