const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define(
  "EmergencyCase",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consultationId: { type: DataTypes.UUID, allowNull: false },
    selectedFacilityId: { type: DataTypes.UUID, allowNull: true },
    severity: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "RESOLVED", "CANCELLED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    activatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "emergency_cases", timestamps: true },
);
