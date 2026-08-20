const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TriageResult = sequelize.define(
  "TriageResult",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consultationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "consultations",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    severity: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
      allowNull: false,
      comment: "Final triage severity level",
    },
    internalScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Internal risk/acuity score (0-100), supports the rules",
    },
    detectedRedFlags: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Array of detected critical red flags",
    },
    triageReasons: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "Array of human-readable reasons why this severity was assigned",
    },
    recommendedAction: {
      type: DataTypes.ENUM(
        "SELF_CARE",
        "ROUTINE_CARE",
        "SEEK_CARE_SOON",
        "URGENT_CARE",
        "IMMEDIATE_EMERGENCY_CARE",
      ),
      allowNull: false,
      comment: "Recommended action based on severity",
    },
    inputConfidence: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      defaultValue: "MEDIUM",
      comment:
        "Confidence in understanding the user's input, NOT medical certainty",
    },
    emergencyGuidance: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Immediate guidance for critical/high cases",
    },
    facilityType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment:
        "Recommended facility type: emergency, urgent_care, clinic, etc.",
    },
    triageMetadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Additional triage metadata for analysis",
    },
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
    tableName: "triage_results",
    timestamps: true,
  },
);

module.exports = TriageResult;
