/**
 * Google Cloud AI Services
 * Handles Speech-to-Text, Natural Language Understanding, and Text-to-Speech
 */

const speech = require("@google-cloud/speech");
const language = require("@google-cloud/language");
const textToSpeech = require("@google-cloud/text-to-speech");

class GoogleCloudAI {
  constructor() {
    // Initialize clients
    this.speechClient = new speech.SpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    this.languageClient = new language.LanguageServiceClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    this.textToSpeechClient = new textToSpeech.TextToSpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  /**
   * Convert audio (base64) to text using Speech-to-Text
   * @param {Buffer} audioContent - Audio file buffer
   * @param {String} languageCode - Language code (e.g., 'en-NG', 'yo-NG')
   * @returns {Object} {transcript, confidence}
   */
  async transcribeAudio(audioContent, languageCode = "en-NG") {
    try {
      const request = {
        audio: {
          content: audioContent,
        },
        config: {
          encoding: "LINEAR16",
          languageCode: languageCode,
          enableAutomaticPunctuation: true,
          model: "latest_long", // Use latest model for better accuracy
        },
      };

      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        .map((result) =>
          result.alternatives[0] ? result.alternatives[0].transcript : "",
        )
        .join("\n");

      const confidence =
        response.results.length > 0
          ? response.results[0].alternatives[0].confidence || 0.95
          : 0;

      return {
        transcript: transcription,
        confidence: confidence,
        success: true,
      };
    } catch (error) {
      console.error("Error transcribing audio:", error);
      return {
        transcript: "",
        confidence: 0,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract entities and structure symptoms from text
   * Uses Google Cloud Natural Language API
   * @param {String} text - The user's input text
   * @returns {Object} {symptoms: [], entities: [], rawAnalysis}
   */
  async extractSymptoms(text) {
    try {
      const document = {
        content: text,
        type: "PLAIN_TEXT",
        language: "en",
      };

      // Get entity analysis
      const [entitiesResponse] = await this.languageClient.analyzeEntities({
        document,
      });

      // Get sentiment (for severity indication)
      const [sentimentResponse] = await this.languageClient.analyzeSentiment({
        document,
      });

      // Extract entities (medical symptoms, conditions)
      const entities = entitiesResponse.entities.map((entity) => ({
        name: entity.name,
        type: entity.type,
        salience: entity.salience,
        mentions: entity.mentions.length,
      }));

      // Simple keyword-based symptom extraction (fallback)
      const symptoms = this._extractSymptomsFromText(text);

      return {
        symptoms: symptoms,
        entities: entities,
        sentiment: sentimentResponse.documentSentiment.score,
        confidence: "HIGH",
        rawAnalysis: {
          entities,
          sentiment: sentimentResponse.documentSentiment,
        },
      };
    } catch (error) {
      console.error("Error analyzing text:", error);
      // Fallback to keyword extraction
      return {
        symptoms: this._extractSymptomsFromText(text),
        entities: [],
        confidence: "MEDIUM",
        error: error.message,
      };
    }
  }

  /**
   * Convert text response to speech (audio)
   * @param {String} text - Text to convert to speech
   * @param {String} languageCode - Language code
   * @returns {Buffer} Audio content buffer
   */
  async synthesizeSpeech(text, languageCode = "en-NG") {
    try {
      const request = {
        input: { text: text },
        voice: {
          languageCode: languageCode,
          ssmlGender: "NEUTRAL",
        },
        audioConfig: { audioEncoding: "MP3" },
      };

      const [response] =
        await this.textToSpeechClient.synthesizeSpeech(request);

      return {
        audioContent: response.audioContent,
        success: true,
      };
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      return {
        audioContent: null,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Simple keyword-based symptom extraction (fallback)
   * Extracts symptoms from user text using predefined keyword lists
   */
  _extractSymptomsFromText(text) {
    const lowerText = text.toLowerCase();

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

    const detectedSymptoms = [];

    for (const [symptom, keywords] of Object.entries(symptomKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          detectedSymptoms.push(symptom);
          break;
        }
      }
    }

    return detectedSymptoms;
  }

  /**
   * Structure user input into machine-readable format
   * Combines transcription, symptom extraction, and sentiment
   */
  async structureConsultationInput(
    audioOrText,
    isAudio = false,
    language = "en-NG",
  ) {
    let transcript = "";
    let transcriptConfidence = 0;

    // Step 1: Transcribe if audio
    if (isAudio) {
      const transcriptionResult = await this.transcribeAudio(
        audioOrText,
        language,
      );
      transcript = transcriptionResult.transcript;
      transcriptConfidence = transcriptionResult.confidence;
    } else {
      transcript = audioOrText;
      transcriptConfidence = 1.0; // Text input has high confidence
    }

    // Step 2: Extract symptoms
    const extractionResult = await this.extractSymptoms(transcript);

    // Step 3: Structure output
    return {
      originalInput: transcript,
      transcriptConfidence: transcriptConfidence,
      symptoms: extractionResult.symptoms,
      entities: extractionResult.entities,
      sentiment: extractionResult.sentiment,
      confidence: extractionResult.confidence,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
module.exports = GoogleCloudAI;
