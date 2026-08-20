const express = require("express");
const EmergencyController = require("../controllers/emergencyController");
const router = express.Router();
router.post("/activate", EmergencyController.activate);
router.post("/:emergencyId/summary", EmergencyController.summary);
module.exports = router;
