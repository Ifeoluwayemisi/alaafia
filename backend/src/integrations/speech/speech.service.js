const WhisperAdapter = require("./whisper.adapter");

class SpeechService {
  constructor(provider = null) {
    this.provider = provider || new WhisperAdapter();
  }

  async transcribeAudio(audioBuffer, languageCode = "en-NG", meta = {}) {
    if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
      return {
        success: false,
        errorCode: "EMPTY_AUDIO",
        message: "Audio payload is empty",
        confidence: null,
      };
    }

    if (!this.provider || typeof this.provider.transcribe !== "function") {
      return {
        success: false,
        errorCode: "SPEECH_PROVIDER_INVALID",
        message: "No speech-to-text provider is configured",
        confidence: null,
      };
    }

    const result = await this.provider.transcribe(
      audioBuffer,
      languageCode,
      meta || {},
    );

    return {
      success: Boolean(result && result.success),
      transcript:
        result && result.success && typeof result.transcript === "string"
          ? result.transcript
          : null,
      detectedLanguage:
        result && typeof result.detectedLanguage === "string"
          ? result.detectedLanguage
          : null,
      errorCode: result && !result.success ? result.errorCode : undefined,
      message: result && !result.success ? result.message : undefined,
      confidence: null,
    };
  }
}

module.exports = SpeechService;
