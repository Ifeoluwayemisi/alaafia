const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define(
  "TriageAssessment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consultationId: { type: DataTypes.UUID, allowNull: false },
    severity: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
      allowNull: false,
    },
    inputConfidence: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      allowNull: false,
      defaultValue: "MEDIUM",
    },
    redFlags: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    requiredCare: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    guidance: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    rulesVersion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "mvp-1",
    },
  },
  { tableName: "triage_assessments", timestamps: true },
);
