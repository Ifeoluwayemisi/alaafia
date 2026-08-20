const { Sequelize } = require("sequelize");
require("dotenv").config();

const commonOptions = {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
};

const useDatabaseSsl = process.env.DATABASE_SSL === "true";

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      ...commonOptions,
      dialectOptions: useDatabaseSsl
        ? {
            ssl: {
              require: true,
              rejectUnauthorized:
                process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
            },
          }
        : {},
    })
  : new Sequelize(
      process.env.DB_NAME || "alafia_db",
      process.env.DB_USER || "postgres",
      process.env.DB_PASSWORD || "postgres",
      {
        ...commonOptions,
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
      },
    );

module.exports = sequelize;
