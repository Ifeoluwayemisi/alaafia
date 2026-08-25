const { WemaPaymentAdapter } = require("./wema.payment.adapter");
const { MockPaymentAdapter } = require("./mock.payment.adapter");

function createPaymentGateway() {
  const gatewayName = String(process.env.PAYMENT_GATEWAY || "").toLowerCase();
  if (gatewayName === "wema") {
    return new WemaPaymentAdapter();
  }
  if (gatewayName === "mock" && process.env.NODE_ENV === "test") {
    return new MockPaymentAdapter();
  }
  return null;
}

module.exports = { createPaymentGateway };
