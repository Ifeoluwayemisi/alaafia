const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReferencePrice = sequelize.define(
  "ReferencePrice",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    serviceCode: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Canonical service identifier, e.g. CONSULTATION_GP",
    },
    serviceName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    facilityTier: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Optional tier the price applies to (e.g. PRIMARY, SECONDARY)",
    },
    amountMinor: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: "Reference price in kobo from a VERIFIED source",
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "NGN",
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Where this price came from, e.g. SHI dataset, tariff publication",
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "When the source was verified by a human",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "reference_prices",
    timestamps: true,
    indexes: [{ fields: ["serviceCode"] }],
  }
);

module.exports = ReferencePrice;
