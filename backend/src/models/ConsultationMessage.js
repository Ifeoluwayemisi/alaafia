const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define(
  "ConsultationMessage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consultationId: { type: DataTypes.UUID, allowNull: false },
    role: {
      type: DataTypes.ENUM("USER", "ASSISTANT", "SYSTEM"),
      allowNull: false,
    },
    inputType: { type: DataTypes.ENUM("TEXT", "VOICE"), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "en-NG",
    },
    confidence: { type: DataTypes.FLOAT, allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: true },
  },
  { tableName: "consultation_messages", timestamps: true },
);
