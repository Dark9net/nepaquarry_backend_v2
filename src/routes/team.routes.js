const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/team.controller");
const {
  validateInviteMember,
  validateUpdateStatus,
  validateUpdateRole,
  validateListMembersQuery,
  validateChangePassword,
} = require("../validator/team.validator");

const router = express.Router();

const requireAdmin = (request, _response, next) =>
  request.auth.role === "ADMIN" ? next() : next(new AppError(403, "You do not have permission to manage team members."));

router.use(authenticate);

router.get("/users", validateListMembersQuery, controller.listMembers);
router.post("/users/invite", requireAdmin, validateInviteMember, controller.inviteMember);
router.patch("/users/:id/status", requireAdmin, validateUpdateStatus, controller.updateStatus);
router.patch("/users/:id/role", requireAdmin, validateUpdateRole, controller.updateRole);
router.patch("/users/change-password", validateChangePassword, controller.changePassword);

module.exports = router;
