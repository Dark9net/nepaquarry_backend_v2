const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const controller = require("../controllers/raw-material-trip-entry.controller");
const { validateTripEntryUpsert } = require("../validator/raw-material-trip-entry.validator");

const router = express.Router();

router.use(authenticate);
router.get("/trips/summary", controller.monthlySummary);
router.get("/trips/day/:date", controller.listDayTrips);
router.get("/trips", controller.listMonthlyRecords);
router.post("/trips", validateTripEntryUpsert, controller.upsertTrip);
router.delete("/trips/:id", controller.deleteTrip);

module.exports = router;
