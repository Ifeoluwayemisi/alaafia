const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SupportContact = sequelize.define(
  "SupportContact",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    supportRequestId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactChannel: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Phone or email used to share the request link; optional in MVP",
    },
    notifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Set when the share link has been sent via the notification path",
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
    tableName: "support_contacts",
    timestamps: true,
  }
);

module.exports = SupportContact;
