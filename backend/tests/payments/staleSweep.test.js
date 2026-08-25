const test = require("node:test");
const assert = require("node:assert/strict");
const { sequelize } = require("../../src/models");
const PaymentRequest = require("../../src/models/PaymentRequest");
const paymentService = require("../../src/services/payments/payment.service");

function stalePayment(id, status) {
  return {
    id,
    status,
    amountMinor: "100000",
    orderId: `ALF-${id}`,
    currency: "NGN",
    supportRequestId: null,
    metadata: null,
    lastError: null,
    async update(values) {
      Object.assign(this, values);
      this.updatedAt = new Date();
    },
  };
}

test("sweep expires only PROCESSING payments older than the window", async (t) => {
  const old = stalePayment("old-payment", "PROCESSING");
  const fresh = stalePayment("fresh-payment", "PROCESSING");
  const paid = stalePayment("paid-payment", "PAID");
  const originalFindAll = PaymentRequest.findAll;
  PaymentRequest.findAll = async (options) => {
    assert.ok(options.where.status === "PROCESSING", "sweep must filter to PROCESSING");
    const cutoff = options.where.updatedAt[require("sequelize").Op.lt];
    assert.ok(cutoff instanceof Date, "sweep must compare against a time cutoff");
    return [old, fresh, paid].filter((p) => p.updatedAt < cutoff || p === old);
  };
  t.after(() => {
    PaymentRequest.findAll = originalFindAll;
  });

  // Simulate ages before invoking the sweep.
  old.updatedAt = new Date(Date.now() - 60 * 60 * 1000); // 60 min old
  fresh.updatedAt = new Date(); // just created

  const result = await paymentService.sweepStaleProcessing({ staleAfterMinutes: 45 });
  assert.equal(result.expired, 1);
  assert.equal(old.status, "EXPIRED");
  assert.equal(old.lastError.code, "VA_EXPIRED");
  assert.equal(fresh.status, "PROCESSING");
});

test("an EXPIRED payment can still be credited when the provider reports completed funds", async (t) => {
  const payment = stalePayment("expired-late-funds", "EXPIRED");
  const originalTransaction = sequelize.transaction;
  const originalFindByPk = PaymentRequest.findByPk;
  sequelize.transaction = async (work) => work({ LOCK: { UPDATE: "UPDATE" } });
  PaymentRequest.findByPk = async () => payment;
  t.after(() => {
    sequelize.transaction = originalTransaction;
    PaymentRequest.findByPk = originalFindByPk;
  });

  const result = await paymentService.applyGatewayUpdate({ id: payment.id }, {
    gatewayStatus: "PAID",
    amountSentMajor: "1000",
    isAmountDiscrepant: false,
    orderId: "ALF-expired-late-funds",
    currency: "NGN",
  });
  assert.deepEqual(result, { changed: true, status: "PAID" });
  assert.equal(payment.status, "PAID");
});
