/**
 * Facility Controller
 * Handles facility search, details, and management
 */

const { Facility } = require("../models");
const FacilityMatchingService = require("../services/facilityMatching");

class FacilityController {
  /**
   * Get all facilities
   * GET /api/v1/facilities
   */
  static async getAllFacilities(req, res) {
    try {
      const facilities = await Facility.findAll();

      return res.status(200).json({
        success: true,
        count: facilities.length,
        facilities,
      });
    } catch (error) {
      console.error("Error fetching facilities:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch facilities",
      });
    }
  }

  /**
   * Get facility by ID
   * GET /api/v1/facilities/:facilityId
   */
  static async getFacility(req, res) {
    try {
      const { facilityId } = req.params;

      const facility = await Facility.findByPk(facilityId);

      if (!facility) {
        return res.status(404).json({
          success: false,
          error: "Facility not found",
        });
      }

      return res.status(200).json({
        success: true,
        facility,
      });
    } catch (error) {
      console.error("Error fetching facility:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch facility",
      });
    }
  }

  /**
   * Search facilities by location and criteria
   * POST /api/v1/facilities/search
   */
  static async searchFacilities(req, res) {
    try {
      const {
        latitude,
        longitude,
        severity = "MEDIUM",
        capabilities = [],
        maxDistance = 15,
      } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: "Latitude and longitude are required",
        });
      }

      const result = await FacilityMatchingService.findMatchingFacilities(
        latitude,
        longitude,
        severity,
        capabilities,
        maxDistance,
      );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error searching facilities:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to search facilities",
      });
    }
  }

  /**
   * Create a new facility (for admin/testing)
   * POST /api/v1/facilities
   */
  static async createFacility(req, res) {
    try {
      const {
        name,
        facilityType,
        latitude,
        longitude,
        address,
        phone,
        email,
        capabilities = [],
        emergencyCapable = false,
        dataSource = "simulated",
        verificationStatus = "unverified",
      } = req.body;

      // Validate required fields
      if (
        !name ||
        !facilityType ||
        latitude === undefined ||
        longitude === undefined
      ) {
        return res.status(400).json({
          success: false,
          error: "Name, facilityType, latitude, and longitude are required",
        });
      }

      const facility = await Facility.create({
        name,
        facilityType,
        latitude,
        longitude,
        address,
        phone,
        email,
        capabilities,
        emergencyCapable,
        dataSource,
        verificationStatus,
      });

      return res.status(201).json({
        success: true,
        facility,
      });
    } catch (error) {
      console.error("Error creating facility:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create facility",
      });
    }
  }

  /**
   * Update facility
   * PUT /api/v1/facilities/:facilityId
   */
  static async updateFacility(req, res) {
    try {
      const { facilityId } = req.params;
      const updates = req.body;

      const facility = await Facility.findByPk(facilityId);

      if (!facility) {
        return res.status(404).json({
          success: false,
          error: "Facility not found",
        });
      }

      await facility.update(updates);

      return res.status(200).json({
        success: true,
        facility,
      });
    } catch (error) {
      console.error("Error updating facility:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update facility",
      });
    }
  }

  /**
   * Update facility operational status
   * PUT /api/v1/facilities/:facilityId/status
   */
  static async updateOperationalStatus(req, res) {
    try {
      const { facilityId } = req.params;
      const { status } = req.body;

      if (!["operational", "limited", "closed", "unknown"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status value",
        });
      }

      const facility = await Facility.findByPk(facilityId);

      if (!facility) {
        return res.status(404).json({
          success: false,
          error: "Facility not found",
        });
      }

      await facility.update({
        operationalStatus: status,
        operationalStatusUpdatedAt: new Date(),
      });

      return res.status(200).json({
        success: true,
        facility,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update operational status",
      });
    }
  }

  /**
   * Delete facility
   * DELETE /api/v1/facilities/:facilityId
   */
  static async deleteFacility(req, res) {
    try {
      const { facilityId } = req.params;

      const facility = await Facility.findByPk(facilityId);

      if (!facility) {
        return res.status(404).json({
          success: false,
          error: "Facility not found",
        });
      }

      await facility.destroy();

      return res.status(200).json({
        success: true,
        message: "Facility deleted",
      });
    } catch (error) {
      console.error("Error deleting facility:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete facility",
      });
    }
  }
}

module.exports = FacilityController;
