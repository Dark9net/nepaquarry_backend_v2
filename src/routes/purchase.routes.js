const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/purchase.controller");
const { purchaseFilesUpload, uploadErrorHandler } = require("../middleware/purchaseUploads");
const {
  validatePurchaseCreate, validatePurchaseUpdate,
  validatePurchaseReview,
} = require("../validator/purchase.validator");

const router = express.Router();

const requireReviewer = (request, _response, next) =>
  ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to review purchases."));

router.use(authenticate);
router.get("/purchases", controller.listPurchases);
router.post("/purchases", purchaseFilesUpload, uploadErrorHandler, validatePurchaseCreate, controller.createPurchase);
router.patch("/purchases/:id", purchaseFilesUpload, uploadErrorHandler, validatePurchaseUpdate, controller.updatePurchase);
router.patch("/purchases/:id/review", requireReviewer, validatePurchaseReview, controller.reviewPurchase);

module.exports = router;
