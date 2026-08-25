const express = require("express");
const fs = require("fs");
const path = require("path");
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
const paymentRoutes = require("./routes/paymentRoutes");
const supportRequestRoutes = require("./routes/supportRequestRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");

const openApiDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, "../docs/openapi.yaml"), "utf8"),
);

const app = express();

// Railway (and most PaaS) terminates TLS at one proxy layer; without this,
// express-rate-limit would count all traffic against the proxy IP and 429
// the entire platform collectively.
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Raw body capture for provider webhook signature verification must run
// before the JSON parser claims the body.
app.use(
  ["/api/v1/webhooks/wema", "/api/v1/webhooks/alatpay"],
  express.raw({ type: "*/*", limit: "1mb" }),
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

app.get("/api-docs.json", (req, res) => {
  res.json(openApiDocument);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

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
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/support-requests", supportRequestRoutes);
app.use("/api/v1/webhooks", webhookRoutes);

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
