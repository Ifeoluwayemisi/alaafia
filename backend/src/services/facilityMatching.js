/**
 * Hospital/Facility Search & Matching Service
 * Implements capability-aware ranking + distance-based recommendations
 */

const { Facility } = require("../models");

class FacilityMatchingService {
  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param {Number} lat1, lon1 - User coordinates
   * @param {Number} lat2, lon2 - Facility coordinates
   * @returns {Number} Distance in kilometers
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Find facilities matching the user's severity and location
   * @param {Number} userLat, userLon - User's coordinates
   * @param {String} severity - Triage severity (CRITICAL, HIGH, MEDIUM, LOW)
   * @param {Array} requiredCapabilities - Capabilities needed
   * @param {Number} maxDistance - Maximum search radius in km
   * @returns {Array} Ranked facilities
   */
  static async findMatchingFacilities(
    userLat,
    userLon,
    severity,
    requiredCapabilities = [],
    maxDistance = 15,
  ) {
    try {
      // Get all facilities
      const allFacilities = await Facility.findAll();

      if (!allFacilities || allFacilities.length === 0) {
        return {
          facilities: [],
          message: "No facilities found in database",
        };
      }

      // Filter by facility type based on severity
      const appropriateFacilityTypes =
        this._getFacilityTypesByServerity(severity);

      let filteredFacilities = allFacilities.filter((f) =>
        appropriateFacilityTypes.includes(f.facilityType),
      );

      // Calculate distance and match score for each facility
      const rankedFacilities = filteredFacilities
        .map((facility) => {
          const distance = this.calculateDistance(
            userLat,
            userLon,
            facility.latitude,
            facility.longitude,
          );

          // Skip if beyond max distance
          if (distance > maxDistance) {
            return null;
          }

          // Calculate capability match score
          const capabilityScore = this._calculateCapabilityMatch(
            facility.capabilities,
            requiredCapabilities,
          );

          // Calculate overall ranking score
          // Formula: capability match (60%) + distance preference (40%)
          const distanceScore = Math.max(
            0,
            100 - (distance / maxDistance) * 100,
          );
          const overallScore = capabilityScore * 0.6 + distanceScore * 0.4;

          return {
            id: facility.id,
            name: facility.name,
            facilityType: facility.facilityType,
            latitude: facility.latitude,
            longitude: facility.longitude,
            address: facility.address,
            phone: facility.phone,
            email: facility.email,
            capabilities: facility.capabilities,
            emergencyCapable: facility.emergencyCapable,
            operationalStatus: facility.operationalStatus,
            dataSource: facility.dataSource,
            verificationStatus: facility.verificationStatus,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            capabilityScore: Math.round(capabilityScore),
            distanceScore: Math.round(distanceScore),
            overallScore: Math.round(overallScore),
            matchedCapabilities: this._getMatchedCapabilities(
              facility.capabilities,
              requiredCapabilities,
            ),
            reason: this._generateReason(
              distance,
              capabilityScore,
              facility.emergencyCapable,
              severity,
            ),
          };
        })
        .filter((f) => f !== null) // Remove null entries (beyond distance)
        .sort((a, b) => b.overallScore - a.overallScore); // Sort by score descending

      return {
        facilities: rankedFacilities.slice(0, 5), // Return top 5
        totalFound: rankedFacilities.length,
        userLocation: { latitude: userLat, longitude: userLon },
        searchParameters: {
          severity,
          maxDistance,
          requiredCapabilities,
        },
      };
    } catch (error) {
      console.error("Error finding facilities:", error);
      return {
        facilities: [],
        error: error.message,
      };
    }
  }

  /**
   * Calculate how well a facility's capabilities match requirements
   */
  static _calculateCapabilityMatch(facilityCapabilities, requiredCapabilities) {
    if (!requiredCapabilities || requiredCapabilities.length === 0) {
      // No specific capabilities required
      return 50; // Neutral score
    }

    if (!facilityCapabilities || facilityCapabilities.length === 0) {
      return 0; // Facility has no capabilities listed
    }

    let matchCount = 0;
    for (const required of requiredCapabilities) {
      if (facilityCapabilities.includes(required)) {
        matchCount++;
      }
    }

    // Calculate percentage match
    return (matchCount / requiredCapabilities.length) * 100;
  }

  /**
   * Get matched capabilities between facility and requirements
   */
  static _getMatchedCapabilities(facilityCapabilities, requiredCapabilities) {
    if (!requiredCapabilities || !facilityCapabilities) {
      return [];
    }

    return facilityCapabilities.filter((cap) =>
      requiredCapabilities.includes(cap),
    );
  }

  /**
   * Get appropriate facility types by severity
   */
  static _getFacilityTypesByServerity(severity) {
    const typesByServerity = {
      CRITICAL: ["hospital"],
      HIGH: ["hospital", "urgent_care"],
      MEDIUM: ["hospital", "urgent_care", "clinic"],
      LOW: ["clinic", "urgent_care"],
    };

    return typesByServerity[severity] || ["clinic"];
  }

  /**
   * Generate human-readable reason for recommendation
   */
  static _generateReason(
    distance,
    capabilityScore,
    emergencyCapable,
    severity,
  ) {
    const reasons = [];

    if (capabilityScore > 70) {
      reasons.push("Strong capability match");
    } else if (capabilityScore > 40) {
      reasons.push("Good capability match");
    }

    if (distance < 3) {
      reasons.push("Very close to your location");
    } else if (distance < 7) {
      reasons.push("Nearby");
    }

    if (emergencyCapable && (severity === "CRITICAL" || severity === "HIGH")) {
      reasons.push("Emergency-capable facility");
    }

    if (reasons.length === 0) {
      reasons.push("Appropriate for your needs");
    }

    return reasons.join(". ");
  }

  /**
   * Get capabilities needed based on triage result
   */
  static getCapabilitiesByTriageResult(triageResult, detectedSymptoms = []) {
    const capabilities = [];

    const symptomCapabilityMap = {
      chest_pain: ["cardiology", "emergency"],
      shortness_of_breath: ["emergency", "pulmonology", "respiratory"],
      severe_headache: ["neurology", "emergency"],
      stroke_symptoms: ["neurology", "emergency"],
      severe_abdominal_pain: ["surgery", "emergency", "gastroenterology"],
      bleeding: ["surgery", "emergency"],
      seizure: ["neurology", "emergency"],
      severe_allergic_reaction: ["emergency", "allergy"],
      pregnancy_emergency: ["obstetrics", "emergency"],
      fever: ["internal_medicine", "infectious_disease"],
    };

    // Map detected symptoms to capabilities
    for (const symptom of detectedSymptoms) {
      if (symptomCapabilityMap[symptom]) {
        capabilities.push(...symptomCapabilityMap[symptom]);
      }
    }

    // Add general requirements based on severity
    if (triageResult.severity === "CRITICAL") {
      capabilities.push("emergency", "intensive_care");
    } else if (triageResult.severity === "HIGH") {
      capabilities.push("emergency");
    }

    // Remove duplicates
    return [...new Set(capabilities)];
  }
}

module.exports = FacilityMatchingService;
