const GoogleCloudAI = require("../integrations/googleCloud");
const { Consultation, ConsultationMessage, Symptom } = require("../models");
const {
  normalizeSymptoms,
  confidenceToNumber,
} = require("../services/symptomNormalizer");

const ai = () => new GoogleCloudAI();

const extract = async (text) => {
  const result = await ai().extractSymptoms(text);
  return {
    symptoms: normalizeSymptoms(result.symptoms),
    confidence: confidenceToNumber(result.confidence),
    entities: result.entities || [],
  };
};

class ContractConsultationController {
  static async create(req, res) {
    const {
      sessionId = null,
      inputType = "TEXT",
      message,
      language = "en-NG",
    } = req.body;
    if (!message)
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "message is required",
          details: [],
        },
      });
    const extracted = await extract(message);
    const consultation = await Consultation.create({
      userId: sessionId,
      initialInput: message,
      initialTranscript: message,
      extractedSymptoms: extracted.symptoms,
      language,
      status: "in_progress",
    });
    await ConsultationMessage.create({
      consultationId: consultation.id,
      role: "USER",
      inputType,
      content: message,
      language,
      confidence: extracted.confidence,
    });
    await Promise.all(
      extracted.symptoms.map((name) =>
        Symptom.create({
          consultationId: consultation.id,
          name: name.replace(/_/g, " "),
          normalizedName: name,
          confidence: extracted.confidence,
        }),
      ),
    );
    return res.status(201).json({
      success: true,
      data: {
        consultation: {
          id: consultation.id,
          status: "ACTIVE",
          createdAt: consultation.createdAt,
        },
        extraction: {
          symptoms: extracted.symptoms.map((name) => ({
            name: name.replace(/_/g, " "),
            confidence: extracted.confidence,
          })),
        },
        nextStep: {
          type: "FOLLOW_UP",
          question: "When did these symptoms start?",
        },
      },
      message: "Consultation created",
    });
  }

  static async message(req, res) {
    const { message, language = "en-NG" } = req.body;
    const consultation = await Consultation.findByPk(req.params.consultationId);
    if (!consultation)
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Consultation not found",
          details: [],
        },
      });
    if (!message)
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "message is required",
          details: [],
        },
      });
    const extracted = await extract(message);
    const existing = consultation.extractedSymptoms || [];
    const symptoms = [...new Set([...existing, ...extracted.symptoms])];
    await ConsultationMessage.create({
      consultationId: consultation.id,
      role: "USER",
      inputType: "TEXT",
      content: message,
      language,
      confidence: extracted.confidence,
    });
    await consultation.update({
      initialInput: `${consultation.initialInput}\n${message}`,
      initialTranscript: `${consultation.initialTranscript || consultation.initialInput}\n${message}`,
      extractedSymptoms: symptoms,
      status: "in_progress",
      language,
    });
    return res.json({
      success: true,
      data: {
        message: { role: "USER", content: message },
        nextStep: { type: "TRIAGE", question: null },
        consultationStatus: "ACTIVE",
      },
      message: "Message recorded",
    });
  }

  static async voice(req, res) {
    const consultation = await Consultation.findByPk(req.params.consultationId);
    if (!consultation)
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Consultation not found",
          details: [],
        },
      });
    if (!req.file)
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "audio file is required",
          details: [],
        },
      });
    const language = req.body.language || "en-NG";
    const result = await ai().transcribeAudio(req.file.buffer, language);
    if (!result.success)
      return res.status(422).json({
        success: false,
        error: {
          code: "TRANSCRIPTION_FAILED",
          message: result.error || "Unable to transcribe audio",
          details: [],
        },
      });
    return res.json({
      success: true,
      data: {
        transcript: result.transcript,
        language,
        confidence: result.confidence,
        requiresConfirmation: true,
      },
      message: "Audio transcribed; confirmation required",
    });
  }

  static async confirmTranscript(req, res) {
    const { transcript, confirmed } = req.body;
    const consultation = await Consultation.findByPk(req.params.consultationId);
    if (!consultation)
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Consultation not found",
          details: [],
        },
      });
    if (!transcript || confirmed !== true)
      return res.status(400).json({
        success: false,
        error: {
          code: "CONFIRMATION_REQUIRED",
          message: "A transcript and confirmed=true are required",
          details: [],
        },
      });
    const extracted = await extract(transcript);
    await ConsultationMessage.create({
      consultationId: consultation.id,
      role: "USER",
      inputType: "VOICE",
      content: transcript,
      language: consultation.language,
      confidence: extracted.confidence,
    });
    await consultation.update({
      initialInput: transcript,
      initialTranscript: transcript,
      extractedSymptoms: extracted.symptoms,
      status: "in_progress",
      transcriptConfidence: extracted.confidence,
    });
    await Promise.all(
      extracted.symptoms.map((name) =>
        Symptom.create({
          consultationId: consultation.id,
          name: name.replace(/_/g, " "),
          normalizedName: name,
          confidence: extracted.confidence,
        }),
      ),
    );
    return res.json({
      success: true,
      data: {
        confirmed: true,
        nextStep: {
          type: "TRIAGE",
          message:
            "Thank you. I'm assessing the urgency of what you've described.",
        },
      },
      message: "Transcript confirmed",
    });
  }
}

module.exports = ContractConsultationController;
