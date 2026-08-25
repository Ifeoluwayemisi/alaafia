const test = require("node:test");
const assert = require("node:assert/strict");
const {
  computePlatformFeeMinor,
  parsePlatformFeeBps,
} = require("../../src/utils/money");

test("3% of ₦10,000 is exactly ₦300", () => {
  assert.equal(computePlatformFeeMinor(1000000, 300), 30000);
});

test("fees floor at kobo granularity, never rounding up against the payer", () => {
  assert.equal(computePlatformFeeMinor(9999, 300), 299);
  assert.equal(computePlatformFeeMinor(101, 333), 3);
});

test("zero basis points always yields a zero fee", () => {
  assert.equal(computePlatformFeeMinor(1000000, 0), 0);
});

test("full-take basis points are accepted and bounded", () => {
  assert.equal(computePlatformFeeMinor(1000, 10000), 1000);
});

test("invalid basis point configurations are rejected", () => {
  assert.throws(() => computePlatformFeeMinor(1000, -1), {
    code: "INVALID_FEE_CONFIGURATION",
  });
  assert.throws(() => computePlatformFeeMinor(1000, 10001), {
    code: "INVALID_FEE_CONFIGURATION",
  });
  assert.throws(() => computePlatformFeeMinor(1000, 12.5), {
    code: "INVALID_FEE_CONFIGURATION",
  });
});

test("huge amounts do not overflow the fee arithmetic", () => {
  const huge = 8000000000000000;
  assert.equal(computePlatformFeeMinor(huge, 300), 240000000000000);
});

test("parsePlatformFeeBps falls back safely on garbage configuration", () => {
  assert.equal(parsePlatformFeeBps(undefined), 0);
  assert.equal(parsePlatformFeeBps(""), 0);
  assert.equal(parsePlatformFeeBps("abc"), 0);
  assert.equal(parsePlatformFeeBps("-50"), 0);
  assert.equal(parsePlatformFeeBps("12000"), 0);
  assert.equal(parsePlatformFeeBps("250"), 250);
  assert.equal(parsePlatformFeeBps(undefined, 150), 150);
});
