const { Consultation, TriageResult, TriageAssessment } = require("../models");
const { TriageEngine } = require("../triage");
const FacilityMatchingService = require("../services/facilityMatching");

const buildRequiredCare = (triage, symptoms) => ({
  emergencyCare: ["HIGH", "CRITICAL"].includes(triage.severity),
  specialties: symptoms.includes("chest_pain")
    ? ["Emergency Medicine", "Cardiology"]
    : ["Emergency Medicine"],
  capabilities: FacilityMatchingService.getCapabilitiesByTriageResult(
    triage,
    symptoms,
  ),
});

class TriageController {
  static async assess(req, res) {
    const consultation = await Consultation.findByPk(req.body.consultationId);
    if (!consultation)
      return res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Consultation not found",
            details: [],
          },
        });

    const structuredInput = {
      symptoms: consultation.extractedSymptoms || [],
      originalInput:
        consultation.initialTranscript || consultation.initialInput || "",
    };
    const triage = TriageEngine.performTriage(structuredInput);
    const requiredCare = buildRequiredCare(triage, structuredInput.symptoms);
    const guidance = {
      title:
        triage.severity === "CRITICAL"
          ? "Seek emergency medical care now"
          : triage.severity === "HIGH"
            ? "Seek medical attention promptly"
            : "Monitor your symptoms and seek appropriate care",
      instructions: [triage.guidance],
    };

    const assessment = await TriageAssessment.create({
      consultationId: consultation.id,
      severity: triage.severity,
      inputConfidence: triage.inputConfidence,
      redFlags: triage.detectedRedFlags,
      requiredCare,
      guidance,
    });
    await TriageResult.findOrCreate({
      where: { consultationId: consultation.id },
      defaults: {
        consultationId: consultation.id,
        severity: triage.severity,
        internalScore: triage.internalScore,
        detectedRedFlags: triage.detectedRedFlags,
        triageReasons: triage.triageReasons,
        recommendedAction: triage.recommendedAction,
        inputConfidence: triage.inputConfidence,
        emergencyGuidance: triage.emergencyGuidance,
      },
    });
    await consultation.update({ status: "triaged" });

    return res.status(200).json({
      success: true,
      data: {
        assessmentId: assessment.id,
        severity: triage.severity,
        confidence: triage.inputConfidence,
        redFlags: triage.triageReasons,
        requiredCare,
        guidance,
        rulesVersion: assessment.rulesVersion,
      },
      message: "Triage assessment completed",
    });
  }

  static async getAssessment(req, res) {
    const assessment = await TriageAssessment.findOne({
      where: { consultationId: req.params.consultationId },
      order: [["createdAt", "DESC"]],
    });
    if (!assessment)
      return res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Triage assessment not found",
            details: [],
          },
        });
    return res.json({
      success: true,
      data: assessment,
      message: "Triage assessment retrieved",
    });
  }

  static async getGuidance(req, res) {
    const assessment = await TriageAssessment.findOne({
      where: { consultationId: req.params.consultationId },
      order: [["createdAt", "DESC"]],
    });
    if (!assessment)
      return res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Guidance not found",
            details: [],
          },
        });
    return res.json({
      success: true,
      data: {
        severity: assessment.severity,
        guidance: assessment.guidance,
        disclaimer:
          "Alafia provides guidance and does not provide a medical diagnosis.",
      },
      message: "Guidance retrieved",
    });
  }
}

module.exports = TriageController;
