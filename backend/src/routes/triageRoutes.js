const express = require("express");
const TriageController = require("../controllers/triageController");
const router = express.Router();
router.post("/", TriageController.assess);
router.get("/:consultationId", TriageController.getAssessment);
router.get("/:consultationId/guidance", TriageController.getGuidance);
module.exports = router;
