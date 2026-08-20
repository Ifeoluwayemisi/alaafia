const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define(
  "FacilityReadiness",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    facilityId: { type: DataTypes.UUID, allowNull: false },
    status: {
      type: DataTypes.ENUM(
        "ACCEPTING_EMERGENCIES",
        "LIMITED_CAPACITY",
        "NOT_ACCEPTING",
        "UNKNOWN",
      ),
      allowNull: false,
      defaultValue: "UNKNOWN",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
    updatedBy: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "facility_readiness", timestamps: true, updatedAt: "updatedAt" },
);
