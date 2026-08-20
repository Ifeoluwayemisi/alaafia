const express = require("express");
const HospitalController = require("../controllers/hospitalController");
const router = express.Router();
router.get("/nearby", HospitalController.nearby);
router.get("/recommended", HospitalController.recommended);
router.get("/:hospitalId", HospitalController.details);
router.post("/:hospitalId/select", HospitalController.select);
module.exports = router;
