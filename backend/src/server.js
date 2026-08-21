require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./models");
const ensureSchema = require("./utils/schemaMigrations");

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    // Create missing tables without Sequelize's destructive alter workflow.
    // Schema changes should be handled through migrations once the MVP schema stabilizes.
    await sequelize.sync();
    await ensureSchema(sequelize);
    console.log("Database synchronized");

    // Start server
    app.listen(PORT, () => {
      console.log(`🩺 Alafia API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
