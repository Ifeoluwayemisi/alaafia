const test = require("node:test");
const assert = require("node:assert/strict");
const { WemaPaymentAdapter } = require("../../src/services/payments/wema.payment.adapter");

const originalFetch = global.fetch;
const originalEnv = {
  ALATPAY_BASE_URL: process.env.ALATPAY_BASE_URL,
  ALATPAY_BUSINESS_ID: process.env.ALATPAY_BUSINESS_ID,
  ALATPAY_SECRET_KEY: process.env.ALATPAY_SECRET_KEY,
};

function setTestConfig() {
  process.env.ALATPAY_BASE_URL = "https://sandbox.example.test";
  process.env.ALATPAY_BUSINESS_ID = "business-id";
  process.env.ALATPAY_SECRET_KEY = "secret-key";
}

test.after(() => {
  global.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("creates a documented virtual-account request without undocumented fields", async () => {
  setTestConfig();
  let received;
  global.fetch = async (url, options) => {
    received = { url, options };
    return {
      ok: true,
      json: async () => ({
        status: true,
        data: {
          transactionId: "provider-transaction-id",
          virtualBankAccountNumber: "8880007577",
          virtualBankCode: "035",
          expiredAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    };
  };

  const result = await new WemaPaymentAdapter().createIntent({
    orderId: "ALF-test",
    amountMinor: 125000,
    currency: "NGN",
    customer: { email: "person@example.test", phone: "08000000000", firstName: "Ada", lastName: "Okafor" },
  });

  assert.equal(received.url, "https://sandbox.example.test/bank-transfer/api/v1/bankTransfer/virtualAccount");
  assert.equal(received.options.headers["Ocp-Apim-Subscription-Key"], "secret-key");
  const body = JSON.parse(received.options.body);
  assert.equal(body.amount, 1250);
  assert.equal("channel" in body, false);
  assert.equal(result.gatewayReference, "provider-transaction-id");
});

test("does not treat undocumented lookup statuses as final", async () => {
  setTestConfig();
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ status: true, data: { status: "processing", amountSent: 1250, isAmountDiscrepant: false } }),
  });
  const result = await new WemaPaymentAdapter().retrieveStatus("provider-transaction-id");
  assert.equal(result.gatewayStatus, "PENDING_GATEWAY");
  assert.equal(result.amountSentMajor, "1250");
});

test("preserves the verified fields required before a payment can be credited", async () => {
  setTestConfig();
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      status: true,
      data: {
        status: "completed",
        amountSent: 1250,
        isAmountDiscrepant: false,
        orderId: "ALF-test",
        currency: "NGN",
      },
    }),
  });
  const result = await new WemaPaymentAdapter().retrieveStatus("provider-transaction-id");
  assert.deepEqual(result, {
    gatewayName: "WEMA_ALATPAY",
    gatewayStatus: "PAID",
    rawStatus: "completed",
    amountSentMajor: "1250",
    isAmountDiscrepant: false,
    orderId: "ALF-test",
    currency: "NGN",
  });
});

test("rejects every webhook until an official signature contract is available", () => {
  assert.throws(
    () => new WemaPaymentAdapter().verifyWebhook({ headers: {} }),
    { code: "WEBHOOK_SIGNATURE_UNVERIFIED" }
  );
});
