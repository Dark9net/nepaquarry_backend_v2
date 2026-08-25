const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { AppError } = require("../lib/error");
const controller = require("../controllers/plant.controller");
const { validatePlantCreate, validatePlantUpdate } = require("../validator/plant.validator");

const router = express.Router();
const requireWrite = (request, _response, next) =>
  ["ADMIN", "SUPERVISOR"].includes(request.auth.role) ? next() : next(new AppError(403, "You do not have permission to manage plants."));

router.use(authenticate);
router.get("/plants", controller.listPlants);
router.post("/plants", requireWrite, validatePlantCreate, controller.createPlant);
router.patch("/plants/:id", requireWrite, validatePlantUpdate, controller.updatePlant);

module.exports = router;
