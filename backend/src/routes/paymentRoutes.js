const express = require("express");
const { PaymentController } = require("../controllers/paymentController");

const router = express.Router();

// Idempotency-Key header is honored on initiation routes.
router.post("/initiate", PaymentController.initiate);
router.get("/:id", PaymentController.details);
router.post("/:id/verify", PaymentController.verify);
router.post("/:id/cancel", PaymentController.cancel);

// Development/test-only; enforced by service + disabled in production.
router.post("/:id/dev-confirm", PaymentController.confirmSimulated);

module.exports = router;
