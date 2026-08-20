const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Consultation = sequelize.define(
  "Consultation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "User ID or anonymous session ID",
    },
    initialInput: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "The user's initial voice/text input",
    },
    initialTranscript: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Raw speech-to-text transcript",
    },
    transcriptConfidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Confidence score from speech-to-text (0-1)",
    },
    extractedSymptoms: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment:
        "Structured symptoms extracted by AI: {symptoms: [], onset: '', severity: null, conscious: true}",
    },
    followUpQuestions: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Array of follow-up questions asked",
    },
    followUpAnswers: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "User responses to follow-up questions",
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: "en",
      allowNull: false,
      comment: "Language code: en, yo, ha, ig, pcm",
    },
    status: {
      type: DataTypes.ENUM("initiated", "in_progress", "triaged", "completed"),
      defaultValue: "initiated",
      allowNull: false,
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
    tableName: "consultations",
    timestamps: true,
  },
);

module.exports = Consultation;
