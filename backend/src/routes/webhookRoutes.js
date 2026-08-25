const express = require("express");
const rateLimit = require("express-rate-limit");
const { createPaymentGateway } = require("../services/payments");

const router = express.Router();
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(webhookLimiter);

/**
 * Canonical route: POST /api/v1/webhooks/wema.
 * The legacy /alatpay alias deliberately shares this one handler while the
 * dashboard URL is migrated. Official ALATPay documentation currently omits
 * a signature header and algorithm, so callbacks are rejected before their
 * payloads can affect payment state.
 */
async function receiveWemaWebhook(req, res) {
  try {
    const gateway = createPaymentGateway();
    if (!gateway) {
      return res.status(503).json({
        success: false,
        error: { code: "GATEWAY_NOT_CONFIGURED", message: "No payment gateway configured", details: [] },
      });
    }
    gateway.verifyWebhook({ headers: req.headers, rawBody: req.body });
    return res.status(501).json({
      success: false,
      error: { code: "WEBHOOK_PROCESSING_UNAVAILABLE", message: "Webhook verification is not available", details: [] },
    });
  } catch (error) {
    if (error.code === "WEBHOOK_SIGNATURE_UNVERIFIED") {
      return res.status(401).json({
        success: false,
        error: { code: error.code, message: "Webhook authentication could not be verified", details: [] },
      });
    }
    console.error(`[webhooks] rejected code=${error.code || "INTERNAL_ERROR"}`);
    return res.status(500).json({
      success: false,
      error: { code: "WEBHOOK_PROCESSING_FAILED", message: "Webhook processing failed", details: [] },
    });
  }
}

router.post(["/wema", "/alatpay"], receiveWemaWebhook);

module.exports = router;
