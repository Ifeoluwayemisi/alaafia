/**
 * Consultation Controller
 * Orchestrates the full consultation flow:
 * Voice Input → Transcription → Symptom Extraction → Triage → Facility Matching
 */

const OpenAIIntegration = require("../integrations/openai");
const speechService = require("../integrations/speech");
const { TriageEngine } = require("../triage");
const FacilityMatchingService = require("../services/facilityMatching");
const { Consultation, TriageResult } = require("../models");

class ConsultationController {
  /**
   * Initialize a new consultation
   * POST /api/v1/consultations/start
   */
  static async startConsultation(req, res) {
    try {
      const { userId = null, language = "en-NG" } = req.body;

      // Create new consultation record
      const consultation = await Consultation.create({
        userId,
        language,
        status: "initiated",
        initialInput: "",
      });

      return res.status(201).json({
        success: true,
        consultationId: consultation.id,
        message: "Consultation started. Ready for input.",
      });
    } catch (error) {
      console.error("Error starting consultation:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to start consultation",
      });
    }
  }

  /**
   * Submit voice/text input and get triage + recommendations
   * POST /api/v1/consultations/:consultationId/submit
   */
  static async submitConsultationInput(req, res) {
    try {
      const { consultationId } = req.params;
      const {
        input, // Text input
        audioBase64, // Base64 encoded audio
        isAudio = false,
        age = null,
        isPregnant = false,
        chronicDiseases = [],
        userLocation = { latitude: 6.5244, longitude: 3.3792 }, // Default to Lagos
        language = "en-NG",
      } = req.body;

      // Validate consultation exists
      const consultation = await Consultation.findByPk(consultationId);
      if (!consultation) {
        return res.status(404).json({
          success: false,
          error: "Consultation not found",
        });
      }

      // Initialize Google Cloud AI
      const openAI = new OpenAIIntegration();

      // ====================================================================
      // STEP 1: Process input (transcribe if audio, or use text)
      // ====================================================================
      let structuredInput;
      let transcript;

      if (isAudio && audioBase64) {
        // Transcribe audio through the self-hosted speech-to-text service
        const audioBuffer = Buffer.from(audioBase64, "base64");
        const transcriptionResult = await speechService.transcribeAudio(
          audioBuffer,
          language,
        );

        if (!transcriptionResult.success) {
          return res.status(400).json({
            success: false,
            error: "Failed to transcribe audio",
            details: transcriptionResult.message,
          });
        }

        transcript = transcriptionResult.transcript;
      } else {
        transcript = input;
      }

      // ====================================================================
      // STEP 2: Extract symptoms and structure input
      // ====================================================================
      const extractionResult = await openAI.extractSymptoms(
        transcript,
        language,
      );

      structuredInput = {
        symptoms: extractionResult.symptoms,
        originalInput: transcript,
        entities: extractionResult.entities,
        sentiment: extractionResult.sentiment,
      };

      // ====================================================================
      // STEP 3: Run triage engine
      // ====================================================================
      const triageResult = TriageEngine.performTriage(structuredInput, {
        age,
        isPregnant,
        chronicDiseases,
      });

      console.log(`[Triage Result] Severity: ${triageResult.severity}`);

      // ====================================================================
      // STEP 4: Find matching facilities
      // ====================================================================
      const requiredCapabilities =
        FacilityMatchingService.getCapabilitiesByTriageResult(
          triageResult,
          structuredInput.symptoms,
        );

      const facilitiesResult =
        await FacilityMatchingService.findMatchingFacilities(
          userLocation.latitude,
          userLocation.longitude,
          triageResult.severity,
          requiredCapabilities,
          15, // Max 15km radius
        );

      // ====================================================================
      // STEP 5: Save results to database
      // ====================================================================
      // Update consultation
      await consultation.update({
        status: "triaged",
        initialInput: transcript,
        initialTranscript: transcript,
        transcriptConfidence:
          typeof extractionResult.confidence === "number"
            ? extractionResult.confidence
            : 0.95,
        extractedSymptoms: structuredInput.symptoms,
        language,
      });

      // Save triage result
      const savedTriageResult = await TriageResult.create({
        consultationId: consultation.id,
        severity: triageResult.severity,
        internalScore: triageResult.internalScore,
        detectedRedFlags: triageResult.detectedRedFlags,
        triageReasons: triageResult.triageReasons,
        recommendedAction: triageResult.recommendedAction,
        inputConfidence:
          extractionResult.confidence === "HIGH"
            ? "HIGH"
            : extractionResult.confidence === "LOW"
              ? "LOW"
              : "MEDIUM",
        emergencyGuidance: triageResult.emergencyGuidance,
        facilityType: facilitiesResult.facilities[0]?.facilityType || "clinic",
      });

      // ====================================================================
      // STEP 6: Generate response
      // ====================================================================
      const explanation = TriageEngine.generateExplanation(triageResult);

      return res.status(200).json({
        success: true,
        consultationId: consultation.id,
        triageResult: {
          severity: triageResult.severity,
          internalScore: triageResult.internalScore,
          recommendedAction: triageResult.recommendedAction,
          guidance: explanation.guidance,
          reasons: explanation.reasons,
          redFlags: explanation.redFlags,
          facilityTypes: explanation.facilityTypes,
        },
        extractedInformation: {
          transcript: transcript,
          detectedSymptoms: structuredInput.symptoms,
          inputConfidence: extractionResult.confidence,
        },
        facilityRecommendations: {
          facilities: facilitiesResult.facilities.slice(0, 3), // Top 3
          searchParameters: facilitiesResult.searchParameters,
        },
        disclaimer: explanation.disclaimer,
      });
    } catch (error) {
      console.error("Error submitting consultation:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to process consultation",
        details: error.message,
      });
    }
  }

  /**
   * Get consultation details
   * GET /api/v1/consultations/:consultationId
   */
  static async getConsultation(req, res) {
    try {
      const { consultationId } = req.params;

      const consultation = await Consultation.findByPk(consultationId, {
        include: [
          {
            model: TriageResult,
            as: "TriageResult",
          },
        ],
      });

      if (!consultation) {
        return res.status(404).json({
          success: false,
          error: "Consultation not found",
        });
      }

      return res.status(200).json({
        success: true,
        consultation,
      });
    } catch (error) {
      console.error("Error fetching consultation:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch consultation",
      });
    }
  }

  /**
   * Generate emergency summary for handoff
   * POST /api/v1/consultations/:consultationId/emergency-summary
   */
  static async generateEmergencySummary(req, res) {
    try {
      const { consultationId } = req.params;

      const consultation = await Consultation.findByPk(consultationId, {
        include: [TriageResult],
      });

      if (!consultation) {
        return res.status(404).json({
          success: false,
          error: "Consultation not found",
        });
      }

      const triageResult = consultation.TriageResult;

      const summary = {
        severity: triageResult.severity,
        timestamp: triageResult.createdAt,
        userReport: consultation.initialInput,
        extractedSymptoms: consultation.extractedSymptoms,
        triageReasons: triageResult.triageReasons,
        detectedRedFlags: triageResult.detectedRedFlags,
        recommendedAction: triageResult.recommendedAction,
        emergencyGuidance: triageResult.emergencyGuidance,
        alafiaAssistance:
          "Patient triaged using ALAFIA healthcare navigation platform",
        disclaimer:
          "This is a triage summary from ALAFIA. Clinical assessment by healthcare professionals is required.",
      };

      return res.status(200).json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to generate summary",
      });
    }
  }
  /**
   * List consultations for the authenticated user
   * GET /api/v1/consultations
   */
  static async listConsultations(req, res) {
    try {
      const { resolveVerifiedActorId } = require("../utils/actor");
      const userId = resolveVerifiedActorId(req);
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = parseInt(req.query.offset) || 0;

      const where = userId ? { userId } : {};
      const { count, rows } = await Consultation.findAndCountAll({
        where,
        include: [{ model: TriageResult, as: "TriageResult" }],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
      });

      return res.status(200).json({
        success: true,
        data: {
          consultations: rows,
          total: count,
          limit,
          offset,
        },
      });
    } catch (error) {
      console.error("Error listing consultations:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to list consultations",
      });
    }
  }
}

module.exports = ConsultationController;
