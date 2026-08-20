const {
  Consultation,
  TriageAssessment,
  Facility,
  HospitalRecommendation,
  EmergencyCase,
} = require("../models");
const FacilityMatchingService = require("../services/facilityMatching");

class HospitalController {
  static async nearby(req, res) {
    const { latitude, longitude, radius = 15 } = req.query;
    if (latitude === undefined || longitude === undefined)
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "latitude and longitude are required",
            details: [],
          },
        });
    const result = await FacilityMatchingService.findMatchingFacilities(
      Number(latitude),
      Number(longitude),
      "MEDIUM",
      [],
      Number(radius),
    );
    return res.json({
      success: true,
      data: {
        hospitals: result.facilities.map((facility) => ({
          ...facility,
          distanceKm: facility.distance,
        })),
      },
      message: "Nearby facilities retrieved",
    });
  }

  static async recommended(req, res) {
    const { consultationId, latitude, longitude, radius = 15 } = req.query;
    const consultation = await Consultation.findByPk(consultationId);
    if (!consultation)
      return res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Consultation not found",
            details: [],
          },
        });
    const assessment = await TriageAssessment.findOne({
      where: { consultationId },
      order: [["createdAt", "DESC"]],
    });
    if (!assessment)
      return res
        .status(409)
        .json({
          success: false,
          error: {
            code: "TRIAGE_REQUIRED",
            message: "Complete triage before requesting recommendations",
            details: [],
          },
        });
    if (latitude === undefined || longitude === undefined)
      return res
        .status(400)
        .json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "latitude and longitude are required",
            details: [],
          },
        });

    const required = assessment.requiredCare?.capabilities || [];
    const result = await FacilityMatchingService.findMatchingFacilities(
      Number(latitude),
      Number(longitude),
      assessment.severity,
      required,
      Number(radius),
    );
    const recommendations = await Promise.all(
      result.facilities.map(async (facility, index) => {
        const explanation = [
          facility.reason,
          facility.verificationStatus === "verified"
            ? "Facility profile is marked verified"
            : "Facility verification is not confirmed",
          "Readiness is unknown; capability does not guarantee capacity",
        ];
        await HospitalRecommendation.create({
          consultationId,
          facilityId: facility.id,
          rank: index + 1,
          score: facility.overallScore,
          capabilityScore: facility.capabilityScore,
          distanceScore: facility.distanceScore,
          emergencyScore: facility.emergencyCapable ? 100 : 0,
          confidenceScore:
            facility.verificationStatus === "verified" ? 100 : 50,
          explanation,
        });
        return {
          hospital: facility,
          distanceKm: facility.distance,
          score: facility.overallScore,
          rank: index + 1,
          match: {
            capability: facility.capabilityScore,
            emergency: facility.emergencyCapable ? 100 : 0,
            specialty: facility.capabilityScore,
            distance: facility.distanceScore,
          },
          whyRecommended: explanation,
          readiness: { status: "UNKNOWN", lastUpdated: null },
        };
      }),
    );
    return res.json({
      success: true,
      data: { recommendations },
      message: "Hospital recommendations retrieved",
    });
  }

  static async details(req, res) {
    const facility = await Facility.findByPk(req.params.hospitalId);
    if (!facility)
      return res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Hospital not found",
            details: [],
          },
        });
    return res.json({
      success: true,
      data: {
        ...facility.toJSON(),
        coordinates: {
          latitude: facility.latitude,
          longitude: facility.longitude,
        },
        verification: {
          source: facility.dataSource,
          status: facility.verificationStatus,
          lastChecked: facility.updatedAt,
        },
        readiness: { status: "UNKNOWN", lastUpdated: null },
      },
      message: "Hospital details retrieved",
    });
  }

  static async select(req, res) {
    const { consultationId } = req.body;
    const [facility, consultation] = await Promise.all([
      Facility.findByPk(req.params.hospitalId),
      Consultation.findByPk(consultationId),
    ]);
    if (!facility || !consultation)
      return res
        .status(404)
        .json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Hospital or consultation not found",
            details: [],
          },
        });
    return res.json({
      success: true,
      data: {
        selectedHospital: { id: facility.id, name: facility.name },
        navigation: {
          latitude: facility.latitude,
          longitude: facility.longitude,
        },
      },
      message: "Hospital selected",
    });
  }
}

module.exports = HospitalController;
