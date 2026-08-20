const sequelize = require("../config/database");
const Consultation = require("./Consultation");
const TriageResult = require("./TriageResult");
const Facility = require("./Facility");
const GuestSession = require("./GuestSession");
const ConsultationMessage = require("./ConsultationMessage");
const Symptom = require("./Symptom");
const TriageAssessment = require("./TriageAssessment");
const FacilityCapability = require("./FacilityCapability");
const FacilityReadiness = require("./FacilityReadiness");
const HospitalRecommendation = require("./HospitalRecommendation");
const EmergencyCase = require("./EmergencyCase");
const EmergencyHandoff = require("./EmergencyHandoff");
const Provider = require("./Provider");
const User = require("./User");
const EmailVerificationCode = require("./EmailVerificationCode");

// Define associations
Consultation.hasOne(TriageResult, {
  foreignKey: "consultationId",
  onDelete: "CASCADE",
});

TriageResult.belongsTo(Consultation, {
  foreignKey: "consultationId",
});

Consultation.hasMany(ConsultationMessage, { foreignKey: "consultationId" });
Consultation.hasMany(Symptom, { foreignKey: "consultationId" });
Consultation.hasMany(TriageAssessment, { foreignKey: "consultationId" });
Consultation.hasMany(HospitalRecommendation, { foreignKey: "consultationId" });
Consultation.hasMany(EmergencyCase, { foreignKey: "consultationId" });
Facility.hasMany(FacilityCapability, { foreignKey: "facilityId" });
Facility.hasMany(FacilityReadiness, { foreignKey: "facilityId" });
Facility.hasMany(HospitalRecommendation, { foreignKey: "facilityId" });
Facility.hasMany(EmergencyCase, { foreignKey: "selectedFacilityId" });
EmergencyCase.hasMany(EmergencyHandoff, { foreignKey: "emergencyCaseId" });
EmergencyCase.belongsTo(Facility, { foreignKey: "selectedFacilityId" });
EmergencyHandoff.belongsTo(EmergencyCase, { foreignKey: "emergencyCaseId" });
EmergencyHandoff.belongsTo(Facility, { foreignKey: "facilityId" });
Provider.belongsTo(Facility, { foreignKey: "facilityId" });
Provider.belongsTo(User, { foreignKey: "userId" });
User.hasMany(EmailVerificationCode, { foreignKey: "userId" });
EmailVerificationCode.belongsTo(User, { foreignKey: "userId" });

// Export models and sequelize instance
module.exports = {
  sequelize,
  Consultation,
  TriageResult,
  Facility,
  GuestSession,
  ConsultationMessage,
  Symptom,
  TriageAssessment,
  FacilityCapability,
  FacilityReadiness,
  HospitalRecommendation,
  EmergencyCase,
  EmergencyHandoff,
  Provider,
  User,
  EmailVerificationCode,
};
