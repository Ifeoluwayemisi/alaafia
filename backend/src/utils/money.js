const NAIRA_UNIT_MINOR = 100;

function assertValidMinor(amountMinor, label = "amount") {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    const err = new Error(`${label} must be a positive integer amount in kobo`);
    err.code = "INVALID_AMOUNT";
    throw err;
  }
}

function toMinor(major) {
  const n = Number(major);
  if (!Number.isFinite(n)) {
    const err = new Error("Amount is not a valid number");
    err.code = "INVALID_AMOUNT";
    throw err;
  }
  const minor = Math.round(n * NAIRA_UNIT_MINOR);
  return minor;
}

function toMajor(minor) {
  assertValidMinor(minor);
  return minor / NAIRA_UNIT_MINOR;
}

function assertNairaDivisible(amountMinor) {
  assertValidMinor(amountMinor);
  if (amountMinor % NAIRA_UNIT_MINOR !== 0) {
    const err = new Error(
      "Gateway supports whole-naira amounts only; kobo remainder not allowed"
    );
    err.code = "AMOUNT_NOT_NAIRA_DIVISIBLE";
    throw err;
  }
}

function calculateFundingGap(estimatedCostMinor, availableFundsMinor) {
  if (!Number.isInteger(estimatedCostMinor) || estimatedCostMinor < 0) {
    const err = new Error("estimatedCostMinor must be a non-negative integer");
    err.code = "INVALID_AMOUNT";
    throw err;
  }
  if (!Number.isInteger(availableFundsMinor) || availableFundsMinor < 0) {
    const err = new Error("availableFundsMinor must be a non-negative integer");
    err.code = "INVALID_AMOUNT";
    throw err;
  }
  return Math.max(0, estimatedCostMinor - availableFundsMinor);
}

function formatNairaMinor(amountMinor) {
  assertValidMinor(amountMinor);
  return `₦${(amountMinor / NAIRA_UNIT_MINOR).toLocaleString("en-NG")}`;
}

module.exports = {
  NAIRA_UNIT_MINOR,
  assertValidMinor,
  assertNairaDivisible,
  toMinor,
  toMajor,
  calculateFundingGap,
  formatNairaMinor,
};
