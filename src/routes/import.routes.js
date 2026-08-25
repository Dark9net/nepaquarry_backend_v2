const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const { importMasterProducts } = require("../controllers/import.controller");
const {
  uploadImportFile,
  validateMasterProductImportFile,
} = require("../validator/import.validator");

const router = express.Router();

const requireAdmin = (request, _response, next) =>
  request.auth.role === "ADMIN" ? next() : next(new AppError(403, "You do not have permission to import products."));

router.use(authenticate);

router.post(
  "/master-products",
  requireAdmin,
  uploadImportFile,
  validateMasterProductImportFile,
  importMasterProducts
);

module.exports = router;
