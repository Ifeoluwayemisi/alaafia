const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// A provider-neutral durable boundary for future authenticated replay handling.
// Unauthenticated callbacks are never written or considered payment evidence.
const WebhookEvent = sequelize.define(
  "WebhookEvent",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    gateway: { type: DataTypes.STRING, allowNull: false },
    providerEventId: { type: DataTypes.STRING, allowNull: true },
    gatewayReference: { type: DataTypes.STRING, allowNull: true },
    orderId: { type: DataTypes.STRING, allowNull: true },
    payloadHash: { type: DataTypes.STRING(64), allowNull: false },
    authenticationStatus: { type: DataTypes.ENUM("VERIFIED", "REJECTED"), allowNull: false },
    processedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "webhook_events",
    timestamps: true,
    indexes: [
      { fields: ["gateway", "providerEventId"] },
      { fields: ["gateway", "payloadHash"] },
    ],
  }
);

module.exports = WebhookEvent;
