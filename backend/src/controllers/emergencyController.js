const {
  Consultation,
  TriageAssessment,
  Facility,
  EmergencyCase,
  EmergencyHandoff,
} = require("../models");

class EmergencyController {
  static async activate(req, res) {
    const { consultationId, hospitalId } = req.body;
    const [consultation, assessment, facility] = await Promise.all([
      Consultation.findByPk(consultationId),
      TriageAssessment.findOne({
        where: { consultationId },
        order: [["createdAt", "DESC"]],
      }),
      Facility.findByPk(hospitalId),
    ]);
    if (!consultation || !assessment)
      return res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Consultation or triage assessment not found",
            details: [],
          },
        });
    if (assessment.severity !== "CRITICAL")
      return res
        .status(409)
        .json({
          success: false,
          error: {
            code: "NOT_CRITICAL",
            message: "Emergency mode requires a CRITICAL assessment",
            details: [],
          },
        });
    if (!facility)
      return res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Hospital not found",
            details: [],
          },
        });
    const emergency = await EmergencyCase.create({
      consultationId,
      selectedFacilityId: facility.id,
      severity: assessment.severity,
    });
    return res
      .status(201)
      .json({
        success: true,
        data: {
          emergencyId: emergency.id,
          status: emergency.status,
          severity: emergency.severity,
        },
        message: "Emergency mode activated",
      });
  }

  static async summary(req, res) {
    const emergency = await EmergencyCase.findByPk(req.params.emergencyId);
    if (!emergency)
      return res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Emergency case not found",
            details: [],
          },
        });
    const [consultation, assessment, facility] = await Promise.all([
      Consultation.findByPk(emergency.consultationId),
      TriageAssessment.findOne({
        where: { consultationId: emergency.consultationId },
        order: [["createdAt", "DESC"]],
      }),
      Facility.findByPk(emergency.selectedFacilityId),
    ]);
    const summary = {
      severity: emergency.severity,
      symptoms: consultation.extractedSymptoms || [],
      onset: consultation.initialInput,
      keyResponses: {},
      recommendedFacility: facility?.name || null,
      guidance: assessment?.guidance || null,
      disclaimer:
        "This is a triage summary from Alafia. Clinical assessment by healthcare professionals is required.",
    };
    const handoff = await EmergencyHandoff.create({
      emergencyCaseId: emergency.id,
      facilityId: emergency.selectedFacilityId,
      summary,
      consentGiven: req.body.patientConsent === true,
      status: "SENT",
      sentAt: new Date(),
    });
    return res.json({
      success: true,
      data: { handoffId: handoff.id, summary },
      message: "Emergency summary generated",
    });
  }
}

module.exports = EmergencyController;
