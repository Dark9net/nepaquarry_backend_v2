const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/product.controller");
const { productPhotoUpload, uploadErrorHandler } = require("../middleware/productUploads");
const {
  validateCategoryCreate, validateCategoryUpdate,
  validateProductCreate, validateProductUpdate,
} = require("../validator/product.validator");

const router = express.Router();
const requireWrite = (request, _response, next) =>
  ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to manage the product catalog."));
const requireAdmin = (request, _response, next) =>
  request.auth.role === "ADMIN" ? next() : next(new AppError(403, "Administrator permission is required."));

router.use(authenticate);

router.get("/product-categories", controller.listCategories);
router.post("/product-categories", requireAdmin, validateCategoryCreate, controller.createCategory);
router.patch("/product-categories/:id", requireAdmin, validateCategoryUpdate, controller.updateCategory);

router.get("/products", controller.listProducts);
router.post("/products", requireWrite, validateProductCreate, controller.createProduct);
router.patch("/products/:id", requireWrite, validateProductUpdate, controller.updateProduct);
router.post("/products/:id/photos/:slot", requireWrite, productPhotoUpload, uploadErrorHandler, controller.uploadProductPhoto);
router.delete("/products/:id/photos/:slot", requireWrite, controller.deleteProductPhoto);

module.exports = router;
