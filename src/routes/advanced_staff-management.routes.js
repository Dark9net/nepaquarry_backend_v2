const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/advanced_staff-management.controller");
const { advanceSlipUpload, uploadErrorHandler } = require("../middleware/advancedStaffManagementUploads");
const {
  validateAdvanceCreate, validateAdvanceReview,
  validateAdditionalRequest, validateAdditionalReview,
  validateSubmitDate,
} = require("../validator/advanced_staff-management.validator");

const router = express.Router();
const requireReviewer = (request, _response, next) => ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to review advance requests."));
const requireAdmin = (request, _response, next) => request.auth.role === "ADMIN" ? next() : next(new AppError(403, "Administrator permission is required."));

router.use(authenticate);
router.get("/advances", controller.listAdvances);
router.post("/advances", validateAdvanceCreate, controller.createAdvance);
router.patch("/advances/:id/review", requireReviewer, validateAdvanceReview, controller.reviewAdvance);
router.patch("/advances/:id/request-additional", validateAdditionalRequest, controller.requestAdditional);
router.patch("/advances/:id/review-additional", requireAdmin, validateAdditionalReview, controller.reviewAdditional);
router.patch("/advances/:id/submit-date", validateSubmitDate, controller.submitTakenDate);
router.post("/advances/:id/upload-slip", advanceSlipUpload, uploadErrorHandler, controller.uploadSlip);

module.exports = router;
