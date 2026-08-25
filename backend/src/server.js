require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./models");
const ensureSchema = require("./utils/schemaMigrations");
const paymentService = require("./services/payments/payment.service");

const PORT = process.env.PORT || 5000;

// Housekeeping: retire PROCESSING payments whose one-time virtual account has
// aged out. Never credits or debits anything; late inflows still verify to PAID.
function startPaymentSweep() {
  if (process.env.NODE_ENV === "test") return;
  const intervalMs = 10 * 60 * 1000;
  const run = async () => {
    try {
      await paymentService.sweepStaleProcessing();
    } catch (error) {
      console.error(`[payments] sweep failed code=${error.code || "UNKNOWN"}`);
    }
  };
  setTimeout(run, 30 * 1000);
  setInterval(run, intervalMs);
}

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

    startPaymentSweep();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
