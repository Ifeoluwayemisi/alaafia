class YarnGPT {
  constructor({
    apiKey = process.env.YARNGPT_API_KEY,
    baseUrl = process.env.YARNGPT_BASE_URL || "https://yarngpt.ai",
  } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async synthesizeSpeech({ text, voice = "Idera", responseFormat = "mp3" }) {
    if (!this.isConfigured()) {
      return { success: false, error: "YARNGPT_API_KEY is not configured" };
    }
    if (!text || text.length > 2000) {
      return {
        success: false,
        error: "Text is required and must be 2000 characters or fewer",
      };
    }

    const response = await fetch(`${this.baseUrl}/api/v1/tts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voice, response_format: responseFormat }),
    });

    if (!response.ok) {
      const details = await response.text();
      return {
        success: false,
        error: `YarnGPT request failed (${response.status})`,
        details,
      };
    }

    return {
      success: true,
      audioContent: Buffer.from(await response.arrayBuffer()),
      contentType:
        response.headers.get("content-type") || `audio/${responseFormat}`,
      responseFormat,
    };
  }
}

module.exports = YarnGPT;
