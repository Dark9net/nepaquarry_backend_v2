const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/staff-management.controller");
const { leaveSlipUpload, uploadErrorHandler } = require("../middleware/staffManagementUploads");
const { validateLeaveCreate, validateLeaveReview } = require("../validator/staff-management.validator");

const router = express.Router();
const requireReviewer = (request, _response, next) => ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to review leave requests."));

router.use(authenticate);
router.get("/leaves", controller.listLeaves);
router.post("/leaves", validateLeaveCreate, controller.createLeave);
router.patch("/leaves/:id/review", requireReviewer, validateLeaveReview, controller.reviewLeave);
router.delete("/leaves/:id", controller.deleteLeave);
router.post("/leaves/:id/upload-slip", leaveSlipUpload, uploadErrorHandler, controller.uploadLeaveSlip);

module.exports = router;
