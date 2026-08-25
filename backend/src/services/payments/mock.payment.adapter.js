const GATEWAY_NAME = "MOCK";

function requireDevMode() {
  if (process.env.NODE_ENV === "production") {
    const err = new Error("Mock payment gateway is disabled in production");
    err.code = "MOCK_GATEWAY_DISABLED";
    throw err;
  }
}

class MockPaymentAdapter {
  constructor() {
    // In-memory simulated outcomes; never persisted as real transactions.
    this.intents = new Map();
  }

  get name() {
    return GATEWAY_NAME;
  }

  get isLive() {
    return false;
  }

  async createIntent({ orderId, amountMinor, currency, customer }) {
    requireDevMode();
    const reference = `MOCK-${orderId}`;
    this.intents.set(reference, { orderId, amountMinor, currency: currency || "NGN", paid: false });
    return {
      gatewayName: GATEWAY_NAME,
      gatewayReference: reference,
      instructions: {
        kind: "SIMULATED",
        note: "This is a development-only simulated payment intent",
        customer: customer?.email || null,
      },
      rawStatus: "PENDING",
      provider: GATEWAY_NAME,
      isLive: false,
    };
  }

  async retrieveStatus(gatewayReference) {
    requireDevMode();
    const intent = this.intents.get(gatewayReference);
    return {
      gatewayName: GATEWAY_NAME,
      gatewayStatus: intent && intent.paid ? "PAID" : "PENDING_GATEWAY",
      rawStatus: intent && intent.paid ? "completed" : "pending",
      amountSentMajor: intent && intent.paid ? String(intent.amountMinor / 100) : null,
      isAmountDiscrepant: false,
      orderId: intent?.orderId || null,
      currency: intent?.currency || null,
      provider: GATEWAY_NAME,
      isLive: false,
    };
  }

  /** Dev/test hook: simulate a completed payment. Disabled in production. */
  simulateCompletion(gatewayReference) {
    requireDevMode();
    const intent = this.intents.get(gatewayReference);
    if (!intent) {
      const err = new Error("Unknown mock payment reference");
      err.code = "PROVIDER_ERROR";
      throw err;
    }
    intent.paid = true;
    return true;
  }

  verifyWebhook() {
    const err = new Error("Mock gateway does not send webhooks");
    err.code = "WEBHOOK_SIGNATURE_UNVERIFIED";
    throw err;
  }
}

module.exports = { MockPaymentAdapter, GATEWAY_NAME };
