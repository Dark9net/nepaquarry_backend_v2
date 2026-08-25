const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/material.controller");
const { validateMaterialCreate, validateMaterialUpdate } = require("../validator/material.validator");

const router = express.Router();
const requireWrite = (request, _response, next) =>
  ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to manage raw materials."));

router.use(authenticate);
router.get("/materials", controller.listMaterials);
router.post("/materials", requireWrite, validateMaterialCreate, controller.createMaterial);
router.patch("/materials/:id", requireWrite, validateMaterialUpdate, controller.updateMaterial);

module.exports = router;
