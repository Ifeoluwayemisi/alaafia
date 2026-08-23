const SpeechService = require("./speech.service");
const WhisperAdapter = require("./whisper.adapter");

const speechService = new SpeechService();

module.exports = speechService;
module.exports.SpeechService = SpeechService;
module.exports.WhisperAdapter = WhisperAdapter;
