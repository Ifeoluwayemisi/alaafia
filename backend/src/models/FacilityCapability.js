const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define(
  "FacilityCapability",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    facilityId: { type: DataTypes.UUID, allowNull: false },
    capability: { type: DataTypes.STRING, allowNull: false },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "simulated",
    },
    lastVerifiedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "facility_capabilities", timestamps: true },
);
