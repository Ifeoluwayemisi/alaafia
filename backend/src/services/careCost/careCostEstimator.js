const { ReferencePrice } = require("../../models");

/**
 * Deterministic reference-price care cost estimator.
 *
 * There are NO hard-coded medical prices in this codebase by design. Estimates
 * are produced exclusively from verified rows in the reference_prices table.
 * Until a verified dataset is loaded, estimation is deterministically
 * unavailable rather than fabricated.
 */
async function estimate({ serviceCodes, facilityTier = null }) {
  if (!Array.isArray(serviceCodes) || serviceCodes.length === 0) {
    const err = new Error("serviceCodes array is required");
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  const where = { serviceCode: serviceCodes, isActive: true };
  const rows = await ReferencePrice.findAll({ where });

  if (!rows || rows.length === 0) {
    return {
      available: false,
      reason: "REFERENCE_PRICE_DATASET_EMPTY",
      message:
        "No verified reference prices are loaded; cost estimates are unavailable",
    };
  }

  const lineItems = rows.map((row) => ({
    serviceCode: row.serviceCode,
    serviceName: row.serviceName,
    facilityTier: row.facilityTier,
    amountMinor: Number(row.amountMinor),
    currency: row.currency,
    source: row.source,
    verifiedAt: row.verifiedAt,
  }));

  const totalMinor = lineItems.reduce((sum, li) => sum + li.amountMinor, 0);
  return {
    available: true,
    lineItems,
    estimatedCostMinor: totalMinor,
    currency: "NGN",
    basis: "REFERENCE_PRICE_DATASET",
  };
}

module.exports = { estimate };
