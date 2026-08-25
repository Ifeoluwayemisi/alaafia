const PaymentRequest = require("../models/PaymentRequest");
const SupportRequest = require("../models/SupportRequest");
const paymentService = require("../services/payments/payment.service");
const { resolveActor } = require("../utils/actor");

const ERROR_STATUS = {
  VALIDATION_ERROR: 400,
  INVALID_AMOUNT: 400,
  IDEMPOTENCY_KEY_REQUIRED: 400,
  IDEMPOTENCY_CONFLICT: 409,
  AMOUNT_NOT_NAIRA_DIVISIBLE: 400,
  GATEWAY_NOT_CONFIGURED: 503,
  PROVIDER_NOT_CONFIGURED: 503,
  MOCK_GATEWAY_DISABLED: 403,
  MOCK_GATEWAY_REQUIRED: 409,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  INVALID_TRANSITION: 409,
  VERIFICATION_NOT_AVAILABLE: 409,
  SUPPORT_REQUEST_CLOSED: 409,
  SUPPORT_REQUEST_FUNDED: 409,
  CONTRIBUTION_EXCEEDS_REMAINING: 422,
  PROVIDER_ERROR: 502,
  PROVIDER_TIMEOUT: 504,
};

function fail(res, error) {
  const status = ERROR_STATUS[error.code] || 500;
  return res.status(status).json({
    success: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: error.message,
      details: [],
    },
  });
}

function publicPaymentView(payment) {
  return {
    id: payment.id,
    type: payment.type,
    status: payment.status,
    amountMinor: Number(payment.amountMinor),
    platformFeeBps: Number(payment.platformFeeBps || 0),
    platformFeeMinor: Number(payment.platformFeeMinor || 0),
    netToCareMinor: Number(
      payment.netToCareMinor != null ? payment.netToCareMinor : payment.amountMinor
    ),
    currency: payment.currency,
    orderId: payment.orderId,
    gateway: payment.gateway,
    virtualAccountDetails: payment.virtualAccountDetails,
    supportRequestId: payment.supportRequestId,
    consultationId: payment.consultationId,
    paidAt: payment.paidAt,
    provider: payment.gateway === "MOCK" ? "MOCK" : (payment.gateway || null),
    isLive: payment.gateway !== "MOCK",
  };
}

class PaymentController {
  static async initiate(req, res) {
    try {
      const { type, amountMinor, currency, consultationId, supportRequestId, actorId, contributorName, contributorContact, customer, description, metadata } = req.body || {};
      const effectiveActorId = resolveActor(req, actorId);
      const idempotencyKey =
        req.get("Idempotency-Key") || (req.body && req.body.idempotencyKey) || null;
      if (!["CARE_PAYMENT", "SUPPORT_CONTRIBUTION"].includes(type)) {
        const err = new Error("type must be CARE_PAYMENT or SUPPORT_CONTRIBUTION");
        err.code = "VALIDATION_ERROR";
        throw err;
      }
      const result = await paymentService.initiate({
        type,
        amountMinor: Number(amountMinor),
        currency,
        consultationId: consultationId || null,
        supportRequestId: supportRequestId || null,
        actorId: effectiveActorId || null,
        contributorName: contributorName || null,
        contributorContact: contributorContact || null,
        customer: customer || null,
        description: description || null,
        idempotencyKey,
        metadata: metadata || null,
      });
      return res.status(result.replayed ? 200 : 201).json({
        success: true,
        data: { ...publicPaymentView(result.payment), replayed: result.replayed },
        message: result.replayed
          ? "Existing payment returned for idempotency key"
          : "Payment initiated; awaiting payment verification",
      });
    } catch (error) {
      return fail(res, error);
    }
  }

  static async details(req, res) {
    try {
      const payment = await PaymentRequest.findByPk(req.params.id);
      if (!payment) {
        const err = new Error("Payment not found");
        err.code = "NOT_FOUND";
        throw err;
      }
      return res.json({
        success: true,
        data: publicPaymentView(payment),
        message: "Payment retrieved",
      });
    } catch (error) {
      return fail(res, error);
    }
  }

  static async verify(req, res) {
    try {
      const { payment, verification } = await paymentService.verify(req.params.id);
      return res.json({
        success: true,
        data: { ...publicPaymentView(payment), verification },
        message: "Payment verification completed",
      });
    } catch (error) {
      return fail(res, error);
    }
  }

  static async cancel(req, res) {
    try {
      const actorId = resolveActor(req, req.body?.actorId);
      const payment = await paymentService.cancel(req.params.id, actorId);
      return res.json({
        success: true,
        data: publicPaymentView(payment),
        message: "Payment cancelled",
      });
    } catch (error) {
      return fail(res, error);
    }
  }

  /**
   * Development-only completion hook for the mock gateway.
   * Disabled unless PAYMENT_GATEWAY=mock and NODE_ENV !== production.
   */
  static async confirmSimulated(req, res) {
    try {
      const { payment } = await paymentService.confirmSimulatedPayment(req.params.id);
      return res.json({
        success: true,
        data: { ...publicPaymentView(payment), provider: "MOCK", isLive: false },
        message: "Simulated payment confirmed (development only)",
      });
    } catch (error) {
      return fail(res, error);
    }
  }
}

module.exports = { PaymentController, ERROR_STATUS, publicPaymentView };
