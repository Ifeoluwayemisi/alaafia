const crypto = require("crypto");
const { sequelize } = require("../../models");
const PaymentRequest = require("../../models/PaymentRequest");
const SupportRequest = require("../../models/SupportRequest");
const { assertValidMinor, computePlatformFeeMinor, parsePlatformFeeBps } = require("../../utils/money");
const { createPaymentGateway } = require("./index");
const { MockPaymentAdapter } = require("./mock.payment.adapter");

// The platform take-rate may apply to crowdfunded gifts only; care payments
// pass through at face value. Charges are OFF by default and additionally
// gated behind a minimum-amount threshold, so no gift is taxed by accident.
// ALATPay's own processor fee is absorbed by the platform, never the payer.
const FEE_ELIGIBLE_TYPES = new Set(["SUPPORT_CONTRIBUTION"]);
const DEFAULT_PLATFORM_FEE_BPS = 0;

function resolveEffectiveFeeBps(type, amountMinor) {
  if (!FEE_ELIGIBLE_TYPES.has(type)) return 0;
  const bps = parsePlatformFeeBps(process.env.PLATFORM_FEE_BPS, DEFAULT_PLATFORM_FEE_BPS);
  if (bps === 0) return 0;
  const rawThreshold = Number(process.env.PLATFORM_FEE_THRESHOLD_MINOR || 0);
  const threshold =
    Number.isSafeInteger(rawThreshold) && rawThreshold > 0 ? rawThreshold : 0;
  if (threshold > 0 && Number(amountMinor) < threshold) return 0;
  return bps;
}

function getPlatformFeePolicy() {
  const rawThreshold = Number(process.env.PLATFORM_FEE_THRESHOLD_MINOR || 0);
  return {
    eligibleTypes: [...FEE_ELIGIBLE_TYPES],
    bps: parsePlatformFeeBps(process.env.PLATFORM_FEE_BPS, DEFAULT_PLATFORM_FEE_BPS),
    thresholdMinor:
      Number.isSafeInteger(rawThreshold) && rawThreshold > 0 ? rawThreshold : 0,
  };
}

const TRANSITIONS = {
  PENDING: ["PROCESSING", "FAILED", "CANCELLED"],
  PROCESSING: ["PAID", "FAILED", "EXPIRED", "CANCELLED"],
  PAID: [],
  FAILED: [],
  EXPIRED: [],
  CANCELLED: [],
};

const TERMINAL_STATUSES = Object.keys(TRANSITIONS).filter(
  (s) => TRANSITIONS[s].length === 0
);

function providerMajorToMinor(value) {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value)) {
    return null;
  }
  const [whole, fraction = ""] = value.split(".");
  const minor = BigInt(whole) * 100n + BigInt((fraction + "00").slice(0, 2));
  return minor <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(minor) : null;
}

function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

function newOrderId() {
  return `ALF-${Date.now().toString(36)}-${crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 10)
    .toUpperCase()}`;
}

function initiationFingerprint({
  type,
  amountMinor,
  currency,
  consultationId,
  supportRequestId,
  actorId,
  platformFeeBps,
  netToCareMinor,
}) {
  const immutable = JSON.stringify({
    type,
    amountMinor,
    currency: String(currency || "NGN").toUpperCase(),
    consultationId: consultationId || null,
    supportRequestId: supportRequestId || null,
    actorId: actorId || null,
    platformFeeBps: platformFeeBps || 0,
    netToCareMinor: netToCareMinor == null ? null : Number(netToCareMinor),
  });
  return crypto.createHash("sha256").update(immutable).digest("hex");
}

function idempotencyConflict() {
  const err = new Error("Idempotency key was already used with different payment details");
  err.code = "IDEMPOTENCY_CONFLICT";
  return err;
}

function requireGateway() {
  const gateway = createPaymentGateway();
  if (!gateway) {
    const err = new Error(
      "No payment gateway configured; set PAYMENT_GATEWAY=wema"
    );
    err.code = "GATEWAY_NOT_CONFIGURED";
    throw err;
  }
  return gateway;
}

async function recalcSupportTotals(supportRequestId, transaction) {
  // Contributions count NET of the platform fee so a request only reads FUNDED
  // once the patient's actual need has been delivered.
  const paidContributions = await PaymentRequest.findAll({
    where: {
      supportRequestId,
      type: "SUPPORT_CONTRIBUTION",
      status: "PAID",
    },
    attributes: ["amountMinor", "platformFeeMinor"],
    transaction,
  });
  const paidTotal = paidContributions.reduce(
    (sum, c) => sum + (Number(c.amountMinor) - Number(c.platformFeeMinor || 0)),
    0
  );
  const request = await SupportRequest.findByPk(supportRequestId, { transaction });
  if (!request) return;
  const received = Number(paidTotal || 0);
  let nextStatus = request.status;
  if (!["EXPIRED", "CANCELLED"].includes(request.status)) {
    if (received >= request.requestedAmountMinor) nextStatus = "FUNDED";
    else if (received > 0) nextStatus = "PARTIALLY_FUNDED";
    else nextStatus = "PENDING";
  }
  await request.update(
    { receivedAmountMinor: received, status: nextStatus },
    { transaction }
  );
}

async function initiate(input) {
  const {
    type,
    amountMinor,
    currency = "NGN",
    consultationId = null,
    supportRequestId = null,
    actorId = null,
    contributorName = null,
    contributorContact = null,
    customer = null,
    description = null,
    idempotencyKey = null,
    metadata = null,
  } = input;

  assertValidMinor(amountMinor);
  if (!idempotencyKey || typeof idempotencyKey !== "string" || idempotencyKey.length > 255) {
    const err = new Error("Idempotency-Key header is required");
    err.code = "IDEMPOTENCY_KEY_REQUIRED";
    throw err;
  }
  const normalizedCurrency = String(currency || "NGN").toUpperCase();
  if (normalizedCurrency !== "NGN") {
    const err = new Error("Only NGN payments are currently supported");
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  if (type === "CARE_PAYMENT" && supportRequestId) {
    const err = new Error("CARE_PAYMENT cannot reference a support request");
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  const feeBps = resolveEffectiveFeeBps(type, Number(amountMinor));
  const platformFeeMinor = computePlatformFeeMinor(Number(amountMinor), feeBps);
  const netToCareMinor = Number(amountMinor) - platformFeeMinor;
  const requestFingerprint = initiationFingerprint({
    type, amountMinor, currency: normalizedCurrency, consultationId, supportRequestId, actorId,
    platformFeeBps: feeBps, netToCareMinor,
  });

  const existing = await PaymentRequest.findOne({ where: { idempotencyKey } });
  if (existing) {
    if (existing.requestFingerprint !== requestFingerprint) throw idempotencyConflict();
    return { payment: existing, replayed: true };
  }

  const gateway = requireGateway();

  if (type === "SUPPORT_CONTRIBUTION") {
    if (!supportRequestId) {
      const err = new Error("SUPPORT_CONTRIBUTION requires supportRequestId");
      err.code = "VALIDATION_ERROR";
      throw err;
    }
    const request = await SupportRequest.findByPk(supportRequestId);
    if (!request) {
      const err = new Error("Support request not found");
      err.code = "NOT_FOUND";
      throw err;
    }
    if (["CANCELLED", "EXPIRED"].includes(request.status)) {
      const err = new Error(`Support request is ${request.status}`);
      err.code = "SUPPORT_REQUEST_CLOSED";
      throw err;
    }
    const remaining =
      request.requestedAmountMinor - Number(request.receivedAmountMinor || 0);
    if (netToCareMinor <= 0) {
      const err = new Error("Contribution nets to nothing after fees");
      err.code = "INVALID_AMOUNT";
      throw err;
    }
    if (netToCareMinor > remaining) {
      const err = new Error(
        "Contribution exceeds the remaining amount needed for this request"
      );
      err.code = "CONTRIBUTION_EXCEEDS_REMAINING";
      throw err;
    }
  }

  let payment;
  try {
    payment = await PaymentRequest.create({
      type,
      status: "PENDING",
      amountMinor,
      currency: normalizedCurrency,
      platformFeeBps: feeBps,
      platformFeeMinor,
      netToCareMinor,
      consultationId,
      supportRequestId,
      actorId,
      contributorName,
      contributorContact,
      idempotencyKey,
      requestFingerprint,
      orderId: newOrderId(),
      metadata,
    });
  } catch (error) {
    if (error.name !== "SequelizeUniqueConstraintError") throw error;
    const concurrent = await PaymentRequest.findOne({ where: { idempotencyKey } });
    if (!concurrent) throw error;
    if (concurrent.requestFingerprint !== requestFingerprint) throw idempotencyConflict();
    return { payment: concurrent, replayed: true };
  }

  try {
    const intent = await gateway.createIntent({
      orderId: payment.orderId,
      amountMinor: Number(amountMinor),
      currency: normalizedCurrency,
      customer,
      description:
        description ||
        (type === "SUPPORT_CONTRIBUTION"
          ? "ALAFIA healthcare support contribution"
          : "ALAFIA healthcare payment"),
    });
    await payment.update({
      status: "PROCESSING",
      gateway: intent.gatewayName,
      gatewayReference: intent.gatewayReference,
      virtualAccountDetails: intent.instructions || null,
    });
    console.log(
      `[payments] intent created paymentId=${payment.id} gateway=${intent.gatewayName} type=${type}`
    );
    return { payment: await payment.reload(), replayed: false };
  } catch (error) {
    await payment.update({
      status: "FAILED",
      lastError: { code: error.code || "PROVIDER_ERROR", message: error.message },
    });
    console.error(
      `[payments] intent failed paymentId=${payment.id} code=${error.code || "PROVIDER_ERROR"}`
    );
    throw error;
  }
}

async function applyGatewayUpdate(payment, result) {
  return sequelize.transaction(async (transaction) => {
    // Lock the canonical row so verification retries and a future authenticated
    // webhook cannot both credit the same payment.
    const lockedPayment = await PaymentRequest.findByPk(payment.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!lockedPayment) return { changed: false, reason: "PAYMENT_NOT_FOUND" };

    const metadata = { ...(lockedPayment.metadata || {}) };
    if (result.amountSentMajor != null) metadata.amountSentMajor = result.amountSentMajor;
    if (result.isAmountDiscrepant != null) metadata.isAmountDiscrepant = result.isAmountDiscrepant;

    if (result.gatewayStatus !== "PAID") {
      return { changed: false, reason: "GATEWAY_REPORTS_PENDING" };
    }
    const sentMinor = providerMajorToMinor(result.amountSentMajor);
    if (
      result.isAmountDiscrepant ||
      sentMinor == null ||
      sentMinor !== Number(lockedPayment.amountMinor) ||
      result.orderId !== lockedPayment.orderId ||
      result.currency !== lockedPayment.currency
    ) {
      await lockedPayment.update(
        {
          metadata,
          lastError: { code: "AMOUNT_MISMATCH", message: "Verified amount does not match the payment request" },
        },
        { transaction }
      );
      return { changed: false, reason: "AMOUNT_MISMATCH" };
    }
    if (!canTransition(lockedPayment.status, "PAID")) {
      return { changed: false, reason: "INVALID_TRANSITION" };
    }
    await lockedPayment.update(
      { status: "PAID", paidAt: new Date(), metadata, lastError: null },
      { transaction }
    );
    if (lockedPayment.supportRequestId) {
      await recalcSupportTotals(lockedPayment.supportRequestId, transaction);
    }
    console.log(`[payments] status updated paymentId=${lockedPayment.id} status=PAID`);
    return { changed: true, status: "PAID" };
  });
}

async function getById(id) {
  return PaymentRequest.findByPk(id);
}

async function verify(paymentId) {
  const payment = await PaymentRequest.findByPk(paymentId);
  if (!payment) {
    const err = new Error("Payment not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  if (TERMINAL_STATUSES.includes(payment.status)) {
    return { payment, verification: { changed: false, reason: "ALREADY_FINAL" } };
  }
  if (!payment.gatewayReference) {
    const err = new Error("Payment has no provider reference to verify");
    err.code = "VERIFICATION_NOT_AVAILABLE";
    throw err;
  }
  const gateway = requireGateway();
  const result = await gateway.retrieveStatus(payment.gatewayReference);
  const outcome = await applyGatewayUpdate(payment, result);
  return { payment: await payment.reload(), verification: outcome };
}

async function cancel(paymentId, actorId) {
  const payment = await PaymentRequest.findByPk(paymentId);
  if (!payment) {
    const err = new Error("Payment not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  if (actorId && payment.actorId && payment.actorId !== actorId) {
    const err = new Error("Not permitted to cancel this payment");
    err.code = "FORBIDDEN";
    throw err;
  }
  if (!canTransition(payment.status, "CANCELLED")) {
    const err = new Error(`Cannot cancel a payment in status ${payment.status}`);
    err.code = "INVALID_TRANSITION";
    throw err;
  }
  await payment.update({ status: "CANCELLED" });
  return payment;
}

/**
 * Development/test-only completion path for the mock gateway.
 * Never trusts frontend claims of success on real gateways.
 */
async function confirmSimulatedPayment(paymentId) {
  const gateway = requireGateway();
  if (!(gateway instanceof MockPaymentAdapter)) {
    const err = new Error("Simulated confirmation is only available on the mock gateway");
    err.code = "MOCK_GATEWAY_REQUIRED";
    throw err;
  }
  const payment = await PaymentRequest.findByPk(paymentId);
  if (!payment) {
    const err = new Error("Payment not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  gateway.simulateCompletion(payment.gatewayReference);
  const result = await gateway.retrieveStatus(payment.gatewayReference);
  const outcome = await applyGatewayUpdate(payment, result);
  return { payment: await payment.reload(), verification: outcome };
}

module.exports = {
  initiate,
  getById,
  verify,
  cancel,
  confirmSimulatedPayment,
  applyGatewayUpdate,
  recalcSupportTotals,
  getPlatformFeePolicy,
};
