const ensureSchema = async (sequelize) => {
  await sequelize.query(
    'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;',
  );
  await sequelize.query(
    'ALTER TABLE "payment_requests" ADD COLUMN IF NOT EXISTS "requestFingerprint" VARCHAR(64);',
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
  await sequelize.query(
    'UPDATE "payment_requests" SET "status" = \'PROCESSING\' WHERE "status" = \'AWAITING_PAYMENT\';',
  );
};

module.exports = ensureSchema;
