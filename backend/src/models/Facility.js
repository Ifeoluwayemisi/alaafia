const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Facility = sequelize.define(
  "Facility",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    facilityType: {
      type: DataTypes.ENUM("hospital", "clinic", "urgent_care", "pharmacy"),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    capabilities: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment:
        "Array of capabilities/services: emergency, surgery, cardiology, obstetrics, etc.",
      defaultValue: [],
    },
    emergencyCapable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Can handle emergency cases 24/7",
    },
    operationalStatus: {
      type: DataTypes.ENUM("operational", "limited", "closed", "unknown"),
      defaultValue: "unknown",
    },
    operationalStatusUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp of last status update",
    },
    dataSource: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Source of facility data: NHFR, simulated, manual, etc.",
    },
    verificationStatus: {
      type: DataTypes.ENUM("verified", "unverified", "pending"),
      defaultValue: "unverified",
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
    tableName: "facilities",
    timestamps: true,
  },
);

module.exports = Facility;
