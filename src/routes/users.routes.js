const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const controller = require("../controllers/users.controller");

const router = express.Router();

router.use(authenticate);
router.get("/users/supervisors", controller.listSupervisors);

module.exports = router;
