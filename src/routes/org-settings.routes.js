const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/org-settings.controller");
const {
  validateUpdateOrgSettings,
  validateUserActivityQuery,
} = require("../validator/org-settings.validator");

const router = express.Router();

const requireAdmin = (request, _response, next) =>
  request.auth.role === "ADMIN" ? next() : next(new AppError(403, "You do not have permission to manage organization settings."));

router.use(authenticate);

router.get("/org-settings", controller.getSettings);
router.patch("/org-settings", requireAdmin, validateUpdateOrgSettings, controller.updateSettings);
router.get("/org-settings/user-logs", validateUserActivityQuery, controller.listUserActivityLogs);

module.exports = router;
