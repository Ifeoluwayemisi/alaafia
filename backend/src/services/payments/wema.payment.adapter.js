const DEFAULT_TIMEOUT_MS = 30000;

const GATEWAY_NAME = "WEMA_ALATPAY";

function config() {
  const baseUrl = String(process.env.ALATPAY_BASE_URL || "").replace(/\/+$/, "");
  const secretKey = process.env.ALATPAY_SECRET_KEY || null;
  const businessId = process.env.ALATPAY_BUSINESS_ID || null;
  const webhookSecret = process.env.ALATPAY_WEBHOOK_SECRET || null;
  const timeoutMs = Number(process.env.ALATPAY_TIMEOUT_MS) > 0
    ? Number(process.env.ALATPAY_TIMEOUT_MS)
    : DEFAULT_TIMEOUT_MS;
  return { baseUrl, secretKey, businessId, webhookSecret, timeoutMs };
}

function isConfigured() {
  const c = config();
  return Boolean(c.baseUrl && c.secretKey && c.businessId);
}

function notConfigured() {
  const err = new Error(
    "Wema/ALATPay credentials are not configured (ALATPAY_BASE_URL, ALATPAY_SECRET_KEY, ALATPAY_BUSINESS_ID)"
  );
  err.code = "PROVIDER_NOT_CONFIGURED";
  throw err;
}

async function request(path, { method = "GET", body = null } = {}) {
  const c = config();
  if (!isConfigured()) notConfigured();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), c.timeoutMs);
  try {
    const response = await fetch(`${c.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": c.secretKey,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    if (!response.ok) {
      const err = new Error(
        `ALATPay request failed with HTTP ${response.status}`
      );
      err.code = "PROVIDER_ERROR";
      err.providerStatus = response.status;
      err.providerPayload = sanitizeProviderPayload(payload);
      throw err;
    }
    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      const err = new Error("ALATPay request timed out");
      err.code = "PROVIDER_TIMEOUT";
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function sanitizeProviderPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  return { status: payload.status ?? null, message: payload.message ?? null };
}

function assertNairaAmount(amountMinor) {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    const err = new Error("amountMinor must be a positive integer in kobo");
    err.code = "INVALID_AMOUNT";
    throw err;
  }
  if (amountMinor % 100 !== 0) {
    const err = new Error(
      "ALATPay accepts whole-naira amounts only for bank transfers"
    );
    err.code = "AMOUNT_NOT_NAIRA_DIVISIBLE";
    throw err;
  }
  return amountMinor / 100;
}

class WemaPaymentAdapter {
  get name() {
    return GATEWAY_NAME;
  }

  get isLive() {
    return true;
  }

  /**
   * Creates a payment intent via the documented ALATPay virtual-account flow.
   * Contract source: https://docs.alatpay.ng/bank-transfer
   */
  async createIntent({ orderId, amountMinor, currency, customer, description }) {
    assertNairaAmount(amountMinor);
    const c = config();
    const payload = await request("/bank-transfer/api/v1/bankTransfer/virtualAccount", {
      method: "POST",
      body: {
        businessId: c.businessId,
        amount: amountMinor / 100,
        currency: currency || "NGN",
        orderId,
        description: description || "ALAFIA healthcare payment",
        customer: {
          email: customer?.email,
          phone: customer?.phone,
          firstName: customer?.firstName || "ALAFIA",
          lastName: customer?.lastName || "Patient",
          metadata: customer?.metadata || "",
        },
      },
    });
    const data = payload && payload.data ? payload.data : null;
    if (!data || !data.transactionId) {
      const err = new Error("ALATPay returned an unexpected initiation response");
      err.code = "PROVIDER_ERROR";
      throw err;
    }
    return {
      gatewayName: GATEWAY_NAME,
      gatewayReference: data.transactionId,
      instructions: {
        kind: "BANK_TRANSFER",
        accountNumber: data.virtualBankAccountNumber || null,
        bankCode: data.virtualBankCode || null,
        expiresAt: data.expiredAt || null,
      },
      rawStatus: data.status ?? null,
    };
  }

  /**
   * Verifies a transaction against the documented status endpoint.
   * Contract source: https://docs.alatpay.ng/bank-transfer (Step 2)
   */
  async retrieveStatus(gatewayReference) {
    if (!gatewayReference) notConfigured();
    const payload = await request(
      `/bank-transfer/api/v1/bankTransfer/transactions/${encodeURIComponent(gatewayReference)}`
    );
    const data = payload && payload.data ? payload.data : null;
    if (!data) {
      const err = new Error("ALATPay returned an unexpected verification response");
      err.code = "PROVIDER_ERROR";
      throw err;
    }
    // The current official reference documents "completed" in its webhook
    // payload, but does not publish an exhaustive status enum for lookup.
    // Treat every other value as non-final rather than guessing a transition.
    const normalizedStatus =
      String(data.status || "").toLowerCase() === "completed"
        ? "PAID"
        : "PENDING_GATEWAY";
    return {
      gatewayName: GATEWAY_NAME,
      gatewayStatus: normalizedStatus,
      rawStatus: data.status ?? null,
      // Preserve the provider decimal text for exact minor-unit validation in
      // the service. Never use floating-point arithmetic for payment amounts.
      amountSentMajor: data.amountSent == null ? null : String(data.amountSent),
      isAmountDiscrepant: Boolean(data.isAmountDiscrepant),
      orderId: data.orderId == null ? null : String(data.orderId),
      currency: data.currency == null ? null : String(data.currency).toUpperCase(),
    };
  }

  /**
   * Webhook signature verification.
   *
   * ALATPay signs webhooks with a Webhook Secret Key obtained from the merchant
   * dashboard; the exact signing algorithm/header is specified on the official
   * "Webhook Validation" documentation page. Until that specification is
   * supplied to this project, verification FAILS CLOSED: no webhook is trusted.
   */
  verifyWebhook({ headers }) {
    void headers;
    const err = new Error(
      "Webhook signature scheme not yet confirmed from official Wema/ALATPay documentation; rejecting webhook"
    );
    err.code = "WEBHOOK_SIGNATURE_UNVERIFIED";
    throw err;
  }
}

module.exports = { WemaPaymentAdapter, GATEWAY_NAME };
