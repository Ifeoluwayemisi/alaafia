const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define(
  "EmergencyHandoff",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    emergencyCaseId: { type: DataTypes.UUID, allowNull: false },
    facilityId: { type: DataTypes.UUID, allowNull: false },
    summary: { type: DataTypes.JSONB, allowNull: false },
    consentGiven: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "SENT", "RECEIVED", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    sentAt: { type: DataTypes.DATE, allowNull: true },
    receivedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "emergency_handoffs", timestamps: true },
);
