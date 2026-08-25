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

/**
 * Platform take-rate arithmetic. Basis points keep rates exact (300 bps = 3%);
 * the BigInt intermediate rules out overflow, and floor() guarantees the fee
 * never rounds up against a payer.
 */
function computePlatformFeeMinor(amountMinor, bps) {
  assertValidMinor(amountMinor);
  if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
    const err = new Error("fee bps must be an integer between 0 and 10000");
    err.code = "INVALID_FEE_CONFIGURATION";
    throw err;
  }
  if (bps === 0) return 0;
  return Number((BigInt(amountMinor) * BigInt(bps)) / 10000n);
}

function parsePlatformFeeBps(rawValue, fallbackBps = 0) {
  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10000) {
    return fallbackBps;
  }
  return parsed;
}

module.exports = {
  NAIRA_UNIT_MINOR,
  assertValidMinor,
  assertNairaDivisible,
  toMinor,
  toMajor,
  calculateFundingGap,
  formatNairaMinor,
  computePlatformFeeMinor,
  parsePlatformFeeBps,
};
