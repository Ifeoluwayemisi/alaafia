const test = require("node:test");
const assert = require("node:assert/strict");
const { sequelize } = require("../../src/models");
const PaymentRequest = require("../../src/models/PaymentRequest");
const paymentService = require("../../src/services/payments/payment.service");

function fakePayment() {
  return {
    id: "payment-id",
    status: "PROCESSING",
    amountMinor: "125000",
    orderId: "ALF-test",
    currency: "NGN",
    supportRequestId: null,
    metadata: null,
    async update(values) { Object.assign(this, values); },
  };
}

test("only credits a verified payment with matching amount, order, and currency", async (t) => {
  const originalTransaction = sequelize.transaction;
  const originalFindByPk = PaymentRequest.findByPk;
  const payment = fakePayment();
  sequelize.transaction = async (work) => work({ LOCK: { UPDATE: "UPDATE" } });
  PaymentRequest.findByPk = async () => payment;
  t.after(() => {
    sequelize.transaction = originalTransaction;
    PaymentRequest.findByPk = originalFindByPk;
  });

  const result = await paymentService.applyGatewayUpdate({ id: payment.id }, {
    gatewayStatus: "PAID",
    amountSentMajor: "1250",
    isAmountDiscrepant: false,
    orderId: "ALF-test",
    currency: "NGN",
  });
  assert.deepEqual(result, { changed: true, status: "PAID" });
  assert.equal(payment.status, "PAID");
});

test("amount mismatch cannot credit a payment", async (t) => {
  const originalTransaction = sequelize.transaction;
  const originalFindByPk = PaymentRequest.findByPk;
  const payment = fakePayment();
  sequelize.transaction = async (work) => work({ LOCK: { UPDATE: "UPDATE" } });
  PaymentRequest.findByPk = async () => payment;
  t.after(() => {
    sequelize.transaction = originalTransaction;
    PaymentRequest.findByPk = originalFindByPk;
  });

  const result = await paymentService.applyGatewayUpdate({ id: payment.id }, {
    gatewayStatus: "PAID",
    amountSentMajor: "1249",
    isAmountDiscrepant: false,
    orderId: "ALF-test",
    currency: "NGN",
  });
  assert.deepEqual(result, { changed: false, reason: "AMOUNT_MISMATCH" });
  assert.equal(payment.status, "PROCESSING");
  assert.equal(payment.lastError.code, "AMOUNT_MISMATCH");
});
