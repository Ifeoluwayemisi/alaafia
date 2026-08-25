const express = require("express");
const SupportRequestController = require("../controllers/supportRequestController");

const router = express.Router();

router.post("/", SupportRequestController.create);
router.get("/:id", SupportRequestController.detailsForPatient);
router.post("/:id/cancel", SupportRequestController.cancel);

// Trusted-contact (public, share-token scoped) routes
router.get("/share/:shareToken", SupportRequestController.getByShareToken);
router.post(
  "/share/:shareToken/contributions",
  SupportRequestController.contribute
);

module.exports = router;
