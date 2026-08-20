const OpenAI = require("openai");
const { toFile } = require("openai/uploads");

const symptomKeywords = {
  chest_pain: [
    "chest pain",
    "chest tightness",
    "heart pain",
    "pressure in chest",
  ],
  shortness_of_breath: [
    "difficulty breathing",
    "shortness of breath",
    "breathless",
    "cannot breathe",
    "gasping",
  ],
  fever: ["fever", "high temperature", "chills", "sweating"],
  cough: ["cough", "coughing", "persistent cough"],
  diarrhea: ["diarrhea", "loose stool", "watery stool"],
  vomiting: ["vomiting", "throwing up", "nausea"],
  headache: ["headache", "head pain", "migraine"],
  weakness: ["weakness", "fatigue", "tired", "exhausted"],
  dizziness: ["dizziness", "dizzy", "vertigo", "spinning"],
  bleeding: ["bleeding", "blood", "hemorrhage"],
  injury: ["injured", "trauma", "accident", "wound", "cut"],
  seizure: ["seizure", "convulsion", "fitting", "jerking"],
};

class OpenAIIntegration {
  constructor({ apiKey = process.env.OPENAI_API_KEY } = {}) {
    this.apiKey = apiKey;
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    this.transcriptionModel =
      process.env.OPENAI_TRANSCRIPTION_MODEL || "whisper-1";
  }

  extractKeywordSymptoms(text) {
    const lowerText = String(text || "").toLowerCase();
    return Object.entries(symptomKeywords)
      .filter(([, keywords]) =>
        keywords.some((keyword) => lowerText.includes(keyword)),
      )
      .map(([symptom]) => symptom);
  }

  async transcribeAudio(audioContent, languageCode = "en-NG") {
    if (!this.client) {
      return { success: false, error: "OPENAI_API_KEY is not configured" };
    }

    try {
      const file = await toFile(audioContent, "alafia-recording.webm");
      const request = {
        file,
        model: this.transcriptionModel,
        response_format: "verbose_json",
      };

      // Whisper expects a short language name, not regional product codes.
      const language = {
        "en-NG": "en",
        pcm: "en",
        "yo-NG": "yo",
        "ha-NG": "ha",
        "ig-NG": "ig",
      }[languageCode];
      if (language) request.language = language;

      const result = await this.client.audio.transcriptions.create(request);
      return {
        success: true,
        transcript: result.text || "",
        confidence:
          typeof result.segments?.[0]?.avg_logprob === "number" ? 0.8 : 0.7,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async extractSymptoms(text, language = "en-NG") {
    const fallbackSymptoms = this.extractKeywordSymptoms(text);
    if (!this.client) {
      return {
        symptoms: fallbackSymptoms,
        entities: [],
        confidence: "MEDIUM",
        provider: "fallback",
      };
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You extract health-related information for ALAFIA. Understand Nigerian English, Nigerian Pidgin (pcm), Yoruba, Hausa, and Igbo when possible. Never diagnose and never assign LOW, MEDIUM, HIGH, or CRITICAL. Return only valid JSON with this shape: {"symptoms":[{"name":"string","normalizedName":"snake_case","confidence":0.0}],"language":"${language}","onset":null,"needsClarification":false}. Use only symptoms explicitly reported or clearly stated.`,
          },
          { role: "user", content: String(text || "") },
        ],
      });
      const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
      const symptoms = Array.isArray(parsed.symptoms) ? parsed.symptoms : [];
      return {
        symptoms: symptoms.length ? symptoms : fallbackSymptoms,
        entities: [],
        onset: parsed.onset || null,
        needsClarification: Boolean(parsed.needsClarification),
        confidence: "HIGH",
        provider: "openai",
      };
    } catch (error) {
      return {
        symptoms: fallbackSymptoms,
        entities: [],
        confidence: "MEDIUM",
        provider: "fallback",
        error: error.message,
      };
    }
  }
}

module.exports = OpenAIIntegration;
