const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/inventory.controller");
const { validateTransactionCreate } = require("../validator/inventory.validator");

const router = express.Router();
const requireWrite = (request, _response, next) =>
  request.auth.role !== "PROCUREMENT" ? next() : next(new AppError(403, "You do not have permission to manage inventory entries."));
const requireAdmin = (request, _response, next) =>
  request.auth.role === "ADMIN" ? next() : next(new AppError(403, "Administrator permission is required."));

router.use(authenticate);
router.get("/inventory", controller.listTransactions);
router.post("/inventory", requireWrite, validateTransactionCreate, controller.createTransaction);
router.delete("/inventory/:id", requireAdmin, controller.deleteTransaction);
router.get("/inventory/summary", controller.getSummary);

module.exports = router;
