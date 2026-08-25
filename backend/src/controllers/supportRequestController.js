const SupportRequest = require("../models/SupportRequest");
const supportRequestService = require("../services/support/supportRequest.service");
const { ERROR_STATUS, publicPaymentView } = require("./paymentController");

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

class SupportRequestController {
  static async create(req, res) {
    try {
      const { patientRef, consultationId, requestedAmountMinor, contacts, message, expiresAt } = req.body || {};
      if (!patientRef) {
        const err = new Error("patientRef is required (user or guest session id)");
        err.code = "VALIDATION_ERROR";
        throw err;
      }
      const request = await supportRequestService.create({
        patientRef,
        consultationId: consultationId || null,
        requestedAmountMinor: Number(requestedAmountMinor),
        contacts: Array.isArray(contacts) ? contacts : [],
        message: message || null,
        expiresAt: expiresAt || null,
      });
      return res.status(201).json({
        success: true,
        data: {
          id: request.id,
          status: request.status,
          requestedAmountMinor: Number(request.requestedAmountMinor),
          receivedAmountMinor: Number(request.receivedAmountMinor),
          remainingAmountMinor:
            Number(request.requestedAmountMinor) - Number(request.receivedAmountMinor),
          currency: request.currency,
          shareToken: request.shareToken,
          expiresAt: request.expiresAt,
        },
        message: "Support request created",
      });
    } catch (error) {
      return fail(res, error);
    }
  }

  /** Public trusted-contact view via secure share token. */
  static async getByShareToken(req, res) {
    try {
      const { request, contributions } = await supportRequestService.getByShareToken(
        req.params.shareToken
      );
      return res.json({
        success: true,
        data: { ...supportRequestService.publicView(request), contributions },
        message: "Support request retrieved",
      });
    } catch (error) {
      return fail(res, error);
    }
  }

  static async detailsForPatient(req, res) {
    try {
      const patientRef = req.query.patientRef || req.body?.patientRef;
      const request = await supportRequestService.getByIdForPatient(
        req.params.id,
        patientRef || null
      );
      return res.json({
        success: true,
        data: {
          id: request.id,
          status: request.status,
          requestedAmountMinor: Number(request.requestedAmountMinor),
          receivedAmountMinor: Number(request.receivedAmountMinor),
          remainingAmountMinor:
            Number(request.requestedAmountMinor) - Number(request.receivedAmountMinor),
          currency: request.currency,
          shareToken: request.shareToken,
          expiresAt: request.expiresAt,
        },
        message: "Support request retrieved",
      });
    } catch (error) {
      return fail(res, error);
    }
  }

  /**
   * Trusted contact chooses an amount; this creates a SUPPORT_CONTRIBUTION
   * payment through the same PaymentService used for care payments.
   */
  static async contribute(req, res) {
    try {
      const { amountMinor, contributorName, contributorContact, customer } = req.body || {};
      const idempotencyKey = req.get("Idempotency-Key") || null;
      const result = await supportRequestService.contribute({
        shareToken: req.params.shareToken,
        amountMinor: Number(amountMinor),
        contributorName: contributorName || null,
        contributorContact: contributorContact || null,
        customer: customer || null,
        idempotencyKey,
      });
      return res.status(result.replayed ? 200 : 201).json({
        success: true,
        data: {
          payment: publicPaymentView(result.payment),
          supportRequest: supportRequestService.publicView(result.supportRequest),
          replayed: result.replayed,
        },
        message: result.replayed
          ? "Existing contribution returned for idempotency key"
          : "Contribution payment initiated; awaiting payment",
      });
    } catch (error) {
      return fail(res, error);
    }
  }

  static async cancel(req, res) {
    try {
      const patientRef = req.body?.patientRef;
      const request = await supportRequestService.cancel(req.params.id, patientRef || null);
      return res.json({
        success: true,
        data: { id: request.id, status: request.status },
        message: "Support request cancelled",
      });
    } catch (error) {
      return fail(res, error);
    }
  }
}

module.exports = SupportRequestController;
