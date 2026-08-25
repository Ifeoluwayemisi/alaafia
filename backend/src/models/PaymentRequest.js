const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PaymentRequest = sequelize.define(
  "PaymentRequest",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("CARE_PAYMENT", "SUPPORT_CONTRIBUTION"),
      allowNull: false,
      comment: "Business purpose; both types share one payment system",
    },
    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "PROCESSING",
        "PAID",
        "FAILED",
        "EXPIRED",
        "CANCELLED"
      ),
      defaultValue: "PENDING",
      allowNull: false,
      comment: "Deterministic lifecycle owned by PaymentService",
    },
    amountMinor: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "Expected amount in kobo (integer)",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "NGN",
    },
    gateway: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "e.g. WEMA_ALATPAY or MOCK; null until an intent is created",
    },
    gatewayReference: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: "Provider transaction identifier (ALATPay transactionId)",
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Our outward-facing reference sent to the gateway",
    },
    idempotencyKey: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: "Client-supplied key preventing duplicate payment creation",
    },
    requestFingerprint: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: "SHA-256 of immutable initiation fields; validates idempotent retries",
    },
    consultationId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    supportRequestId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    actorId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "User ID or guest session ID initiating the payment",
    },
    contributorName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Display name for SUPPORT_CONTRIBUTION payments",
    },
    contributorContact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    virtualAccountDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Bank transfer instructions shown to the payer",
    },
    paidAt: { type: DataTypes.DATE, allowNull: true },
    lastError: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Last gateway failure { code, message }; never contains secrets",
    },
    metadata: { type: DataTypes.JSONB, allowNull: true },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "payment_requests",
    timestamps: true,
    indexes: [
      { fields: ["supportRequestId"] },
      { fields: ["consultationId"] },
      { fields: ["type", "status"] },
    ],
  }
);

module.exports = PaymentRequest;
