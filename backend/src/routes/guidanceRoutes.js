const express = require("express");
const TriageController = require("../controllers/triageController");
const router = express.Router();
router.get("/:consultationId", TriageController.getGuidance);
module.exports = router;
