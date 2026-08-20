/**
 * ALAFIA Triage Engine
 * Implements layered triage logic: Critical → High → Medium → Low
 */

const {
  CRITICAL_RED_FLAGS,
  HIGH_ACUITY_PATTERNS,
  MEDIUM_URGENCY_PATTERNS,
  LOW_URGENCY_PATTERNS,
  RISK_MODIFIERS,
  ACTIONS_BY_SEVERITY,
  FACILITY_TYPES_BY_SEVERITY,
} = require("./rules");

class TriageEngine {
  /**
   * Main triage function
   * @param {Object} structuredInput - AI-extracted symptoms
   * @param {Object} options - Configuration options
   * @returns {Object} Triage result
   */
  static performTriage(structuredInput, options = {}) {
    const { age = null, isPregnant = false, chronicDiseases = [] } = options;

    // Initialize result object
    const result = {
      severity: "LOW",
      internalScore: 0,
      detectedRedFlags: [],
      triageReasons: [],
      emergencyGuidance: null,
      inputConfidence: "MEDIUM",
    };

    // Convert input to searchable text
    const searchText = this._prepareSearchText(structuredInput);

    // ========================================================================
    // LAYER 1: CRITICAL RED FLAGS (overrides all scoring)
    // ========================================================================
    const criticalFlags = this._checkCriticalRedFlags(
      searchText,
      structuredInput,
    );

    if (criticalFlags.length > 0) {
      result.severity = "CRITICAL";
      result.detectedRedFlags = criticalFlags;
      result.triageReasons = criticalFlags.map((flag) => flag.reason);
      result.internalScore = 95;
      result.emergencyGuidance =
        "This requires immediate emergency medical attention. Seek emergency care now.";
      return this._finalizeResult(result, structuredInput);
    }

    // ========================================================================
    // LAYER 2: HIGH-ACUITY PATTERNS
    // ========================================================================
    const highAcuityFindings = this._checkHighAcuityPatterns(
      searchText,
      structuredInput,
    );

    if (highAcuityFindings.length > 0) {
      result.severity = "HIGH";
      result.triageReasons = highAcuityFindings.map((f) => f.reason);
      result.internalScore = Math.max(
        ...highAcuityFindings.map((f) => f.weight),
      );
      result.emergencyGuidance =
        "You need urgent medical evaluation. Visit an emergency facility or urgent care as soon as possible.";
      return this._finalizeResult(result, structuredInput);
    }

    // ========================================================================
    // LAYER 3: MODERATE-URGENCY PATTERNS
    // ========================================================================
    const mediumUrgencyFindings = this._checkMediumUrgencyPatterns(
      searchText,
      structuredInput,
    );

    if (mediumUrgencyFindings.length > 0) {
      result.severity = "MEDIUM";
      result.triageReasons = mediumUrgencyFindings.map((f) => f.reason);
      result.internalScore = Math.max(
        ...mediumUrgencyFindings.map((f) => f.weight),
      );
      return this._finalizeResult(result, structuredInput);
    }

    // ========================================================================
    // LAYER 4: LOW-URGENCY / DEFAULT
    // ========================================================================
    result.severity = "LOW";
    result.triageReasons = [
      "No concerning symptoms detected. Self-care management is appropriate.",
    ];
    result.internalScore = 5;

    return this._finalizeResult(result, structuredInput);
  }

  /**
   * Check for critical red flags
   */
  static _checkCriticalRedFlags(searchText, structuredInput) {
    const flags = [];

    for (const [key, flagDef] of Object.entries(CRITICAL_RED_FLAGS)) {
      // Handle multi-pattern checks (e.g., chest pain + breathing)
      if (flagDef.isMultiPattern) {
        const hasChestPain = this._matchPattern(
          searchText,
          "chest pain|chest tightness|chest pressure|heart pain",
        );
        const hasBreathingDifficulty = this._matchPattern(
          searchText,
          "difficulty breathing|shortness of breath|cannot breathe|breathless|gasping",
        );

        if (hasChestPain && hasBreathingDifficulty) {
          flags.push({
            key,
            reason: flagDef.reason,
            weight: flagDef.weight,
          });
        }
      } else {
        // Single pattern check
        if (this._matchPattern(searchText, flagDef.pattern)) {
          flags.push({
            key,
            reason: flagDef.reason,
            weight: flagDef.weight,
          });
        }
      }
    }

    return flags;
  }

  /**
   * Check for high-acuity patterns
   */
  static _checkHighAcuityPatterns(searchText, structuredInput) {
    const findings = [];

    for (const [key, pattern] of Object.entries(HIGH_ACUITY_PATTERNS)) {
      if (this._matchPattern(searchText, pattern.pattern)) {
        findings.push({
          key,
          reason: pattern.reason,
          weight: pattern.weight,
        });
      }
    }

    return findings;
  }

  /**
   * Check for medium-urgency patterns
   */
  static _checkMediumUrgencyPatterns(searchText, structuredInput) {
    const findings = [];

    for (const [key, pattern] of Object.entries(MEDIUM_URGENCY_PATTERNS)) {
      if (this._matchPattern(searchText, pattern.pattern)) {
        findings.push({
          key,
          reason: pattern.reason,
          weight: pattern.weight,
        });
      }
    }

    return findings;
  }

  /**
   * Check for low-urgency patterns
   */
  static _checkLowUrgencyPatterns(searchText, structuredInput) {
    const findings = [];

    for (const [key, pattern] of Object.entries(LOW_URGENCY_PATTERNS)) {
      if (this._matchPattern(searchText, pattern.pattern)) {
        findings.push({
          key,
          reason: pattern.reason,
          weight: pattern.weight,
        });
      }
    }

    return findings;
  }

  /**
   * Apply risk modifiers (age, pregnancy, chronic disease)
   */
  static _applyRiskModifiers(baseScore, options) {
    let modifiedScore = baseScore;
    const modifierReasons = [];

    const { age, isPregnant, chronicDiseases } = options;

    if (age) {
      if (age >= 80) {
        modifiedScore *= RISK_MODIFIERS.age.veryElderly.multiplier;
        modifierReasons.push(RISK_MODIFIERS.age.veryElderly.reason);
      } else if (age >= 65) {
        modifiedScore *= RISK_MODIFIERS.age.elderly.multiplier;
        modifierReasons.push(RISK_MODIFIERS.age.elderly.reason);
      } else if (age < 1) {
        modifiedScore *= RISK_MODIFIERS.age.infant.multiplier;
        modifierReasons.push(RISK_MODIFIERS.age.infant.reason);
      } else if (age < 5) {
        modifiedScore *= RISK_MODIFIERS.age.child.multiplier;
        modifierReasons.push(RISK_MODIFIERS.age.child.reason);
      }
    }

    if (isPregnant) {
      modifiedScore *= RISK_MODIFIERS.pregnant.multiplier;
      modifierReasons.push(RISK_MODIFIERS.pregnant.reason);
    }

    if (chronicDiseases && chronicDiseases.length > 0) {
      modifiedScore *= RISK_MODIFIERS.chronicDisease.multiplier;
      modifierReasons.push(RISK_MODIFIERS.chronicDisease.reason);
    }

    return { modifiedScore: Math.min(100, modifiedScore), modifierReasons };
  }

  /**
   * Match pattern against search text (regex)
   */
  static _matchPattern(text, pattern) {
    try {
      const regex = new RegExp(pattern, "gi");
      return regex.test(text);
    } catch (e) {
      console.error(`Invalid pattern: ${pattern}`, e);
      return false;
    }
  }

  /**
   * Prepare searchable text from structured input
   */
  static _prepareSearchText(structuredInput) {
    let text = "";

    if (structuredInput.symptoms && Array.isArray(structuredInput.symptoms)) {
      text += structuredInput.symptoms.join(" ");
    }

    if (structuredInput.originalInput) {
      text += ` ${structuredInput.originalInput}`;
    }

    if (structuredInput.userReportedSeverity) {
      text += ` ${structuredInput.userReportedSeverity}`;
    }

    if (structuredInput.additionalContext) {
      text += ` ${structuredInput.additionalContext}`;
    }

    return text.toLowerCase().replace(/_/g, " ");
  }

  /**
   * Finalize result with action and facility recommendations
   */
  static _finalizeResult(result, structuredInput) {
    const actionData =
      ACTIONS_BY_SEVERITY[result.severity] || ACTIONS_BY_SEVERITY.LOW;

    return {
      ...result,
      recommendedAction: actionData.action,
      facilityTypes: FACILITY_TYPES_BY_SEVERITY[result.severity] || ["clinic"],
      guidance: actionData.guidance,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate explainable summary for frontend
   */
  static generateExplanation(triageResult) {
    return {
      severity: triageResult.severity,
      guidance: triageResult.guidance || triageResult.emergencyGuidance,
      reasons: triageResult.triageReasons,
      redFlags: triageResult.detectedRedFlags || [],
      recommendedAction: triageResult.recommendedAction,
      facilityTypes: triageResult.facilityTypes,
      disclaimer:
        "Alafia uses deterministic safety-first triage informed by WHO emergency triage principles. This is a prototype; clinical deployment requires formal medical validation.",
    };
  }
}

module.exports = TriageEngine;
