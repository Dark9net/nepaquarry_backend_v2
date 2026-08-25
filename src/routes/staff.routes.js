const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/staff.controller");
const { staffUploads, uploadErrorHandler } = require("../middleware/staffUploads");
const { validateDepartmentCreate, validateDepartmentUpdate, validateStaffCreate, validateStaffUpdate } = require("../validator/staff.validator");

const router = express.Router();
const requireWrite = (request, _response, next) => ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to manage staff."));
const requireAdmin = (request, _response, next) => request.auth.role === "ADMIN" ? next() : next(new AppError(403, "Administrator permission is required."));

router.use(authenticate);
router.get("/departments", controller.listDepartments);
router.post("/departments", requireAdmin, validateDepartmentCreate, controller.createDepartment);
router.patch("/departments/:id", requireAdmin, validateDepartmentUpdate, controller.updateDepartment);
router.get("/staff", controller.listStaff);
router.post("/staff", requireWrite, staffUploads, uploadErrorHandler, validateStaffCreate, controller.createStaff);
router.patch("/staff/:id", requireWrite, staffUploads, uploadErrorHandler, validateStaffUpdate, controller.updateStaff);
router.delete("/staff/:id", requireAdmin, controller.deactivateStaff);

module.exports = router;
