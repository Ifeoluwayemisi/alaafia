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
const PaymentRequest = require("./PaymentRequest");
const SupportRequest = require("./SupportRequest");
const SupportContact = require("./SupportContact");
const ReferencePrice = require("./ReferencePrice");
const WebhookEvent = require("./WebhookEvent");

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

// Payments & financial access
Consultation.hasMany(PaymentRequest, { foreignKey: "consultationId" });
PaymentRequest.belongsTo(Consultation, { foreignKey: "consultationId" });
SupportRequest.hasMany(PaymentRequest, {
  foreignKey: "supportRequestId",
  as: "contributions",
  constraints: false,
});
PaymentRequest.belongsTo(SupportRequest, {
  foreignKey: "supportRequestId",
  constraints: false,
});
SupportRequest.hasMany(SupportContact, { foreignKey: "supportRequestId" });
SupportContact.belongsTo(SupportRequest, { foreignKey: "supportRequestId" });

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
  PaymentRequest,
  SupportRequest,
  SupportContact,
  ReferencePrice,
  WebhookEvent,
};
