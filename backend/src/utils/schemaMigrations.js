const repairOrphanedEnums = async (sequelize) => {
  const enumTables = [
    ["enum_consultations_status", "consultations"],
    ["enum_triage_results_severity", "triage_results"],
    ["enum_facilities_facilityType", "facilities"],
    ["enum_users_role", "users"],
    ["enum_payment_requests_status", "payment_requests"],
  ];

  for (const [enumName, tableName] of enumTables) {
    await sequelize.query(
      `DO $$ BEGIN
        IF to_regclass('public."${tableName}"') IS NULL
           AND EXISTS (SELECT 1 FROM pg_type WHERE typname = '${enumName}')
        THEN DROP TYPE IF EXISTS "${enumName}" CASCADE;
        END IF;
      END $$;`,
    );
  }
};

const ensureSchema = async (sequelize) => {
  await sequelize.query(
    'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;',
  );
  await sequelize.query(
    'ALTER TABLE "payment_requests" ADD COLUMN IF NOT EXISTS "requestFingerprint" VARCHAR(64);',
  );
  await sequelize.query(
    'ALTER TABLE "payment_requests" ADD COLUMN IF NOT EXISTS "platformFeeBps" INTEGER NOT NULL DEFAULT 0;',
  );
  await sequelize.query(
    'ALTER TABLE "payment_requests" ADD COLUMN IF NOT EXISTS "platformFeeMinor" BIGINT NOT NULL DEFAULT 0;',
  );
  await sequelize.query(
    'ALTER TABLE "payment_requests" ADD COLUMN IF NOT EXISTS "netToCareMinor" BIGINT NOT NULL DEFAULT 0;',
  );
  // Pre-fee contribution rows carried no fee, so their net equals their gross.
  await sequelize.query(
    'UPDATE "payment_requests" SET "netToCareMinor" = "amountMinor" WHERE "type" = \'SUPPORT_CONTRIBUTION\' AND "netToCareMinor" = 0;',
  );
  await sequelize.query(
    'CREATE UNIQUE INDEX IF NOT EXISTS "payment_requests_gateway_reference_unique" ON "payment_requests" ("gatewayReference") WHERE "gatewayReference" IS NOT NULL;',
  );
  // sequelize.sync() creates new tables, while this narrow compatibility step
  // preserves existing MVP payment rows without introducing a second migration
  // framework. PostgreSQL enum values cannot be changed by sync alone.
  await sequelize.query(
    'ALTER TYPE "enum_payment_requests_status" ADD VALUE IF NOT EXISTS \'PROCESSING\';',
  );
  // Safely migrate legacy AWAITING_PAYMENT status if it exists in the enum
  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'enum_payment_requests_status'::regtype
        AND enumlabel = 'AWAITING_PAYMENT'
      ) THEN
        UPDATE "payment_requests" SET "status" = 'PROCESSING' WHERE "status" = 'AWAITING_PAYMENT';
      END IF;
    END
    $$;
  `);
};

module.exports = ensureSchema;
module.exports.repairOrphanedEnums = repairOrphanedEnums;
