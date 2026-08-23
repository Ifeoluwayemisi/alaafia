const DEFAULT_TIMEOUT_MS = 60000;

const APP_TO_WHISPER_LANGUAGE = {
  "en-NG": "en",
  pcm: "en",
  "yo-NG": "yo",
  "ha-NG": "ha",
  "ig-NG": "ig",
};

const EXTENSION_BY_CONTENT_TYPE = {
  "audio/webm": "webm",
  "video/webm": "webm",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/flac": "flac",
};

class WhisperAdapter {
  constructor(options = {}) {
    this.options = options;
  }

  _config() {
    const o = this.options || {};
    const timeoutRaw = Number(o.timeoutMs ?? process.env.WHISPER_TIMEOUT_MS);
    return {
      baseUrl:
        String(o.baseUrl ?? process.env.WHISPER_SERVICE_URL ?? "")
          .replace(/\/+$/, "") || null,
      token: o.token ?? process.env.WHISPER_SERVICE_TOKEN ?? null,
      timeoutMs: timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS,
    };
  }

  isConfigured() {
    return Boolean(this._config().baseUrl);
  }

  async transcribe(audioBuffer, languageCode, { contentType } = {}) {
    if (!this.isConfigured()) {
      return this._failure(
        "SPEECH_SERVICE_NOT_CONFIGURED",
        "Speech-to-text service URL is not configured",
      );
    }
    if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
      return this._failure("EMPTY_AUDIO", "Audio payload is empty");
    }

    const { baseUrl, token, timeoutMs } = this._config();
    if (!baseUrl) {
      return this._failure(
        "SPEECH_SERVICE_NOT_CONFIGURED",
        "Speech-to-text service URL is not configured",
      );
    }
    if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
      return this._failure("EMPTY_AUDIO", "Audio payload is empty");
    }

    const whisperLanguage = APP_TO_WHISPER_LANGUAGE[languageCode] || null;
    const extension =
      EXTENSION_BY_CONTENT_TYPE[(contentType || "").toLowerCase()] || "webm";
    const form = new FormData();
    form.append(
      "audio",
      new Blob([audioBuffer], {
        type: contentType || "application/octet-stream",
      }),
      `recording.${extension}`,
    );
    if (whisperLanguage) form.append("language", whisperLanguage);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    console.log(
      `[speech] Whisper transcription requested (bytes=${audioBuffer.length}, language=${whisperLanguage || "auto"})`,
    );

    try {
      const response = await fetch(`${baseUrl}/transcribe`, {
        method: "POST",
        body: form,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal: controller.signal,
      });
      return await this._handleResponse(response, languageCode);
    } catch (error) {
      if (controller.signal.aborted || error.name === "AbortError") {
        console.error(
          `[speech] Whisper transcription failed (timed out after ${timeoutMs}ms)`,
        );
        return this._failure(
          "TRANSCRIPTION_TIMEOUT",
          "Speech-to-text request timed out",
        );
      }
      const detail = error.cause?.code || error.code || error.name;
      console.error(`[speech] Whisper transcription failed (${detail})`);
      return this._failure(
        "TRANSCRIPTION_UNAVAILABLE",
        "Speech-to-text service is unavailable",
      );
    } finally {
      clearTimeout(timer);
    }
  }

  async _handleResponse(response, requestedLanguage) {
    if (!response.ok) {
      return this._failureFromResponse(response);
    }

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    const data = payload && payload.success ? payload.data : null;
    if (!data || typeof data.text !== "string") {
      console.error(
        "[speech] Whisper transcription failed (unexpected response shape)",
      );
      return this._failure(
        "TRANSCRIPTION_FAILED",
        "Speech-to-text service returned an invalid response",
      );
    }

    console.log("[speech] Whisper transcription completed");
    return {
      success: true,
      transcript: data.text.trim(),
      detectedLanguage:
        typeof data.language === "string" ? data.language : null,
      requestedLanguage: requestedLanguage || null,
      confidence: null,
    };
  }

  async _failureFromResponse(response) {
    let upstreamMessage = null;
    try {
      const payload = await response.json();
      if (payload && payload.error && typeof payload.error.message === "string") {
        upstreamMessage = payload.error.message;
      } else if (typeof payload?.detail === "string") {
        upstreamMessage = payload.detail;
      }
    } catch {
      upstreamMessage = null;
    }

    console.error(
      `[speech] Whisper transcription failed (status=${response.status})`,
    );

    const statusToErrorCode = {
      400: ["INVALID_AUDIO", upstreamMessage],
      401: ["SPEECH_SERVICE_UNAUTHORIZED", "Speech-to-text service rejected credentials"],
      404: ["TRANSCRIPTION_FAILED", "Speech-to-text endpoint not found"],
      413: ["AUDIO_TOO_LARGE", "Audio exceeds the allowed size"],
      422: ["TRANSCRIPTION_FAILED", upstreamMessage],
    };

    const [errorCode, defaultMessage] =
      statusToErrorCode[response.status] || [
        "TRANSCRIPTION_FAILED",
        "Speech-to-text service error",
      ];

    return this._failure(
      errorCode,
      (upstreamMessage || defaultMessage).slice(0, 200),
    );
  }

  _failure(errorCode, message) {
    return {
      success: false,
      errorCode,
      message,
      confidence: null,
    };
  }
}

module.exports = WhisperAdapter;
