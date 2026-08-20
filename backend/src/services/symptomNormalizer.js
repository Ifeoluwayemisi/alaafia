const NORMALIZED_SYMPTOMS = new Set([
  "chest_pain",
  "shortness_of_breath",
  "fever",
  "cough",
  "diarrhea",
  "vomiting",
  "headache",
  "weakness",
  "dizziness",
  "bleeding",
  "injury",
  "seizure",
  "stroke_symptoms",
  "severe_abdominal_pain",
  "severe_allergic_reaction",
  "pregnancy_emergency",
]);

const toNormalizedName = (value) => {
  if (typeof value === "string") {
    return value.trim().toLowerCase().replace(/\s+/g, "_");
  }
  if (value && typeof value === "object") {
    return toNormalizedName(value.normalizedName || value.name);
  }
  return "";
};

const normalizeSymptoms = (symptoms) => {
  if (!Array.isArray(symptoms)) return [];

  return [
    ...new Set(
      symptoms
        .map(toNormalizedName)
        .filter(Boolean)
        .map((name) => (NORMALIZED_SYMPTOMS.has(name) ? name : name)),
    ),
  ];
};

const confidenceToNumber = (confidence) => {
  if (typeof confidence === "number")
    return Math.max(0, Math.min(1, confidence));
  if (confidence === "HIGH") return 0.9;
  if (confidence === "LOW") return 0.3;
  return 0.6;
};

module.exports = { normalizeSymptoms, confidenceToNumber, toNormalizedName };
