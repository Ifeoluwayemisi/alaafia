const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define(
  "HospitalRecommendation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consultationId: { type: DataTypes.UUID, allowNull: false },
    facilityId: { type: DataTypes.UUID, allowNull: false },
    rank: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.FLOAT, allowNull: false },
    capabilityScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    emergencyScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    specialtyScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    distanceScore: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    confidenceScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    explanation: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  },
  { tableName: "hospital_recommendations", timestamps: true },
);
