const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SupportRequest = sequelize.define(
  "SupportRequest",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patientRef: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "User ID or guest session ID that owns this request",
    },
    consultationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "Care context where appropriate",
    },
    requestedAmountMinor: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    receivedAmountMinor: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
      comment: "Derived from PAID SUPPORT_CONTRIBUTION payments",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "NGN",
    },
    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "PARTIALLY_FUNDED",
        "FUNDED",
        "EXPIRED",
        "CANCELLED"
      ),
      defaultValue: "PENDING",
      allowNull: false,
    },
    shareToken: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
      comment: "Secure token embedded in the trusted-contact link",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Optional note from the patient to trusted contacts",
    },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
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
    tableName: "support_requests",
    timestamps: true,
  }
);

module.exports = SupportRequest;
