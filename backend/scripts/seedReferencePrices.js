require("dotenv").config();

const { sequelize } = require("../src/models");
const ReferencePrice = require("../src/models/ReferencePrice");

// Indicative private-facility price points for Nigeria (NGN kobo).
// These are NOT verified tariffs: verifiedAt stays null and the source label
// makes their provenance explicit. Replace rows with verified SHI/tariff
// publications as they become available; the estimator consumes whatever is
// active in this table.
const INDICATIVE_PRICES = [
  { serviceCode: "CONSULTATION_GP", serviceName: "General practitioner consultation", amountMinor: 500000 },
  { serviceCode: "CONSULTATION_SPECIALIST", serviceName: "Specialist consultation", amountMinor: 1500000 },
  { serviceCode: "EMERGENCY_CARE_INITIAL", serviceName: "Emergency care initial assessment", amountMinor: 3000000 },
  { serviceCode: "LABORATORY_BASIC", serviceName: "Basic laboratory panel", amountMinor: 1000000 },
  { serviceCode: "IMAGING_XRAY", serviceName: "X-ray imaging", amountMinor: 1500000 },
  { serviceCode: "ULTRASOUND_BASIC", serviceName: "Basic ultrasound scan", amountMinor: 2000000 },
  { serviceCode: "ADMISSION_WARD_DAILY", serviceName: "Ward admission (per day)", amountMinor: 5000000 },
  { serviceCode: "AMBULANCE_TRANSPORT", serviceName: "Ambulance transport", amountMinor: 2500000 },
  { serviceCode: "PHARMACY_BASIC", serviceName: "Basic pharmacy supplies", amountMinor: 1500000 },
];

async function seed() {
  await sequelize.authenticate();
  let created = 0;
  let updated = 0;
  for (const item of INDICATIVE_PRICES) {
    const existing = await ReferencePrice.findOne({
      where: { serviceCode: item.serviceCode, facilityTier: null },
    });
    if (existing) {
      await existing.update({
        serviceName: item.serviceName,
        amountMinor: item.amountMinor,
        currency: "NGN",
        source: "ALAFIA_INTERNAL_INDICATIVE",
        verifiedAt: null,
        isActive: true,
      });
      updated += 1;
    } else {
      await ReferencePrice.create({
        ...item,
        facilityTier: null,
        currency: "NGN",
        source: "ALAFIA_INTERNAL_INDICATIVE",
        verifiedAt: null,
        isActive: true,
      });
      created += 1;
    }
  }
  console.log(`[seed] reference_prices created=${created} updated=${updated}`);
  await sequelize.close();
}

seed().catch((error) => {
  console.error(`[seed] failed: ${error.message}`);
  process.exit(1);
});
