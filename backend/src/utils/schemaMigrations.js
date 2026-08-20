const ensureSchema = async (sequelize) => {
  await sequelize.query(
    'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;',
  );
};

module.exports = ensureSchema;
