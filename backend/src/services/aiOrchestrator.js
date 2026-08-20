const GoogleCloudAI = require("../integrations/googleCloud");
const YarnGPT = require("../integrations/yarngpt");
const { TriageEngine } = require("../triage");
const {
  normalizeSymptoms,
  confidenceToNumber,
} = require("./symptomNormalizer");

class AIOrchestrator {
  constructor({
    speechAndAnalysis = new GoogleCloudAI(),
    voiceOutput = new YarnGPT(),
  } = {}) {
    this.speechAndAnalysis = speechAndAnalysis;
    this.voiceOutput = voiceOutput;
  }

  async structureText({ text, language = "en-NG" }) {
    const extracted = await this.speechAndAnalysis.extractSymptoms(text);
    return {
      language,
      originalTranscript: text,
      symptoms: normalizeSymptoms(extracted.symptoms),
      entities: extracted.entities || [],
      transcriptConfidence: 1,
      extractionConfidence: confidenceToNumber(extracted.confidence),
    };
  }

  async structureAudio({ audio, language = "en-NG" }) {
    const transcript = await this.speechAndAnalysis.transcribeAudio(
      audio,
      language,
    );
    if (!transcript.success) return { success: false, error: transcript.error };
    const structured = await this.structureText({
      text: transcript.transcript,
      language,
    });
    return {
      success: true,
      ...structured,
      transcriptConfidence: transcript.confidence,
    };
  }

  assess(structuredInput, options = {}) {
    return TriageEngine.performTriage(
      {
        symptoms: structuredInput.symptoms,
        originalInput: structuredInput.originalTranscript,
      },
      options,
    );
  }

  async synthesizeApprovedGuidance({
    triageResult,
    language = "en-NG",
    voice = "Idera",
  }) {
    const text = triageResult.guidance || triageResult.emergencyGuidance;
    return this.voiceOutput.synthesizeSpeech({ text, language, voice });
  }

  async processText({
    text,
    language = "en-NG",
    triageOptions = {},
    voice = "Idera",
  }) {
    const structuredInput = await this.structureText({ text, language });
    const triageResult = this.assess(structuredInput, triageOptions);
    const audio = await this.synthesizeApprovedGuidance({
      triageResult,
      language,
      voice,
    });
    return { structuredInput, triageResult, audio };
  }
}

module.exports = AIOrchestrator;
