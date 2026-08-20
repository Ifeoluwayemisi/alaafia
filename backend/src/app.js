const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

// Import routes
const consultationRoutes = require("./routes/consultationRoutes");
const facilityRoutes = require("./routes/facilityRoutes");
const authRoutes = require("./routes/authRoutes");
const triageRoutes = require("./routes/triageRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const guidanceRoutes = require("./routes/guidanceRoutes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Alafia API is running",
    service: "alafia-backend",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1/consultations", consultationRoutes);
app.use("/api/v1/facilities", facilityRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/triage", triageRoutes);
app.use("/api/v1/hospitals", hospitalRoutes);
app.use("/api/v1/emergency", emergencyRoutes);
app.use("/api/v1/guidance", guidanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

module.exports = app;
