/**
 * ALAFIA Triage Rules
 * Implements layered triage logic based on WHO emergency triage principles
 *
 * Layer 1 (Critical) → Layer 2 (High) → Layer 3 (Medium) → Layer 4 (Low)
 * Critical red flags always override scoring
 */

// ============================================================================
// CRITICAL RED FLAGS (Layer 1)
// ============================================================================
const CRITICAL_RED_FLAGS = {
  // Airway & Breathing
  unresponsive: {
    pattern:
      "unresponsive|unconscious|unaware|not responding|fallen|passed out",
    weight: 100,
    reason: "Unresponsive or severe altered consciousness",
  },
  severeRespiratoryDistress: {
    pattern:
      "severe difficulty breathing|gasping|cannot breathe|extreme shortness of breath|stridor",
    weight: 100,
    reason: "Severe respiratory distress",
  },
  centralCyanosis: {
    pattern: "blue lips|blue face|cyanosis|turning blue",
    weight: 100,
    reason: "Central cyanosis (severe oxygen deprivation)",
  },

  // Circulation & Bleeding
  activeMajorBleeding: {
    pattern:
      "severe bleeding|heavy bleeding|blood spurting|major bleeding|cannot stop bleeding",
    weight: 100,
    reason: "Active major bleeding",
  },
  severeShock: {
    pattern:
      "pale|sweating|very weak|very faint|pulse very weak|barely conscious|collapsing",
    weight: 95,
    reason: "Signs of severe shock",
  },

  // Neurological
  seizure: {
    pattern:
      "seizure|convulsion|fitting|jerking|twitching uncontrollably|convulsing",
    weight: 100,
    reason: "Active seizure or convulsion",
  },
  severeAlteredConsciousness: {
    pattern:
      "very confused|severely confused|delirious|cannot speak|incoherent|very drowsy",
    weight: 95,
    reason: "Severe altered mental status",
  },

  // Other Emergencies
  chestPainWithBreathing: {
    pattern:
      "chest pain.*breathing|breathing.*chest pain|chest.*difficulty.*breathe",
    isMultiPattern: true,
    weight: 95,
    reason: "Chest pain combined with breathing difficulty",
  },
  strokeLikeSymptoms: {
    pattern:
      "facial drooping|sudden weakness|sudden numbness|speech difficulty|sudden confusion",
    weight: 90,
    reason: "Possible stroke (facial drooping, weakness, speech difficulty)",
  },
  severeAllergicReaction: {
    pattern:
      "severe allergic|anaphylaxis|throat swelling|cannot breathe from allergy|severe swelling",
    weight: 95,
    reason: "Severe allergic reaction or anaphylaxis",
  },
  poisoning: {
    pattern:
      "poisoned|poisoning|swallowed|overdose|ingested toxic|dangerous substance",
    weight: 95,
    reason: "Suspected poisoning or overdose",
  },
  severeTrauma: {
    pattern:
      "hit head hard|severe accident|major trauma|uncontrolled bleeding|broken limb|impaled",
    weight: 95,
    reason: "Severe trauma with high-risk injury",
  },
};

// ============================================================================
// HIGH-ACUITY PATTERNS (Layer 2)
// ============================================================================
const HIGH_ACUITY_PATTERNS = {
  chestPain: {
    pattern:
      "chest pain|chest tightness|chest pressure|heart pain|chest discomfort",
    weight: 50,
    reason: "Chest pain (requires urgent evaluation)",
  },
  breathingDifficulty: {
    pattern:
      "difficulty breathing|shortness of breath|cannot catch breath|breathless|dyspnea",
    weight: 45,
    reason: "Breathing difficulty",
  },
  severeHeadache: {
    pattern:
      "worst headache|severe headache|worst of my life|thunderclap headache|unbearable headache",
    weight: 45,
    reason: "Severe headache (possible meningitis, hemorrhage)",
  },
  severeAbdominalPain: {
    pattern:
      "severe stomach pain|severe abdominal pain|unbearable belly pain|acute abdomen",
    weight: 40,
    reason: "Severe abdominal pain",
  },
  vomitingBlood: {
    pattern: "vomiting blood|coughing blood|bloody vomit|hemoptysis",
    weight: 50,
    reason: "Hemoptysis or hematemesis",
  },
  pregnancyEmergency: {
    pattern:
      "severe bleeding pregnant|pregnant severe pain|pregnant very weak|pregnant difficulty breathing|pregnancy complication",
    weight: 60,
    reason: "Pregnancy-related emergency",
  },
  severeAcidosis: {
    pattern:
      "diabetic|unconscious diabetic|not taking insulin|very high blood sugar|acidosis",
    weight: 50,
    reason: "Possible diabetic emergency (DKA)",
  },
  severeHypertension: {
    pattern:
      "severe headache.*very high blood pressure|blood pressure very high|hypertensive crisis",
    weight: 45,
    reason: "Severe hypertension with symptoms",
  },
};

// ============================================================================
// MODERATE-URGENCY PATTERNS (Layer 3)
// ============================================================================
const MEDIUM_URGENCY_PATTERNS = {
  fever: {
    pattern:
      "fever|high temperature|very hot|temperature high|chills|sweating|feverish",
    weight: 20,
    reason: "Fever (requires evaluation)",
  },
  cough: {
    pattern: "cough|coughing|persistent cough|bad cough",
    weight: 15,
    reason: "Cough",
  },
  diarrhea: {
    pattern: "diarrhea|loose stool|running stomach|watery stool",
    weight: 15,
    reason: "Diarrhea",
  },
  vomiting: {
    pattern: "vomiting|throwing up|nauseous|feeling sick",
    weight: 20,
    reason: "Vomiting or nausea",
  },
  mildAbdominalPain: {
    pattern: "stomach pain|belly pain|abdominal pain|tummy ache",
    weight: 15,
    reason: "Abdominal discomfort",
  },
  injuryWithModeratePain: {
    pattern: "injured|twisted|sprained|cut|wound",
    weight: 20,
    reason: "Injury or trauma",
  },
  urinarySymptoms: {
    pattern:
      "painful urination|burning urination|frequent urination|urinary tract",
    weight: 10,
    reason: "Urinary symptoms",
  },
};

// ============================================================================
// LOW-URGENCY PATTERNS (Layer 4)
// ============================================================================
const LOW_URGENCY_PATTERNS = {
  mildCold: {
    pattern: "cold|sneezing|runny nose|stuffy nose|common cold|mild symptoms",
    weight: 5,
    reason: "Mild cold symptoms",
  },
  mildHeadache: {
    pattern: "headache|mild headache|head pain",
    weight: 5,
    reason: "Mild headache",
  },
  skinIssues: {
    pattern: "rash|itch|itching|skin problem|small cut",
    weight: 3,
    reason: "Skin issue",
  },
};

// ============================================================================
// AGE & RISK MODIFIERS
// ============================================================================
const RISK_MODIFIERS = {
  age: {
    elderly: {
      minAge: 65,
      multiplier: 1.2,
      reason: "Elderly patient (age 65+)",
    },
    veryElderly: {
      minAge: 80,
      multiplier: 1.4,
      reason: "Very elderly patient (age 80+)",
    },
    infant: {
      maxAge: 1,
      multiplier: 1.3,
      reason: "Infant (age <1)",
    },
    child: {
      maxAge: 5,
      multiplier: 1.15,
      reason: "Young child (age <5)",
    },
  },
  pregnant: {
    pattern: "pregnant|pregnancy",
    multiplier: 1.25,
    reason: "Patient is pregnant",
  },
  chronicDisease: {
    pattern:
      "diabetic|diabetes|heart disease|hypertension|kidney disease|asthma",
    multiplier: 1.1,
    reason: "Patient has chronic disease",
  },
};

// ============================================================================
// RECOMMENDED ACTIONS
// ============================================================================
const ACTIONS_BY_SEVERITY = {
  CRITICAL: {
    action: "IMMEDIATE_EMERGENCY_CARE",
    guidance:
      "This requires immediate emergency medical attention. Call emergency services or go to the nearest emergency facility now.",
  },
  HIGH: {
    action: "URGENT_CARE",
    guidance:
      "You need urgent medical evaluation. Visit an emergency facility or urgent care center as soon as possible.",
  },
  MEDIUM: {
    action: "SEEK_CARE_SOON",
    guidance:
      "You should see a healthcare provider soon. Schedule an appointment or visit a clinic today.",
  },
  LOW: {
    action: "ROUTINE_CARE",
    guidance:
      "You can manage this with self-care or routine care. If symptoms persist or worsen, seek medical attention.",
  },
};

// ============================================================================
// FACILITY TYPE RECOMMENDATIONS
// ============================================================================
const FACILITY_TYPES_BY_SEVERITY = {
  CRITICAL: ["hospital", "emergency"],
  HIGH: ["hospital", "urgent_care", "clinic"],
  MEDIUM: ["clinic", "urgent_care"],
  LOW: ["clinic", "pharmacy"],
};

module.exports = {
  CRITICAL_RED_FLAGS,
  HIGH_ACUITY_PATTERNS,
  MEDIUM_URGENCY_PATTERNS,
  LOW_URGENCY_PATTERNS,
  RISK_MODIFIERS,
  ACTIONS_BY_SEVERITY,
  FACILITY_TYPES_BY_SEVERITY,
};
