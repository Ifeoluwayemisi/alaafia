/**
 * Facility Routes
 */

const express = require("express");
const FacilityController = require("../controllers/facilityController");

const router = express.Router();

/**
 * GET /api/v1/facilities
 * Get all facilities
 */
router.get("/", FacilityController.getAllFacilities);

/**
 * POST /api/v1/facilities/search
 * Search facilities by location and criteria
 */
router.post("/search", FacilityController.searchFacilities);

/**
 * POST /api/v1/facilities
 * Create a new facility (admin)
 */
router.post("/", FacilityController.createFacility);

/**
 * GET /api/v1/facilities/:facilityId
 * Get facility by ID
 */
router.get("/:facilityId", FacilityController.getFacility);

/**
 * PUT /api/v1/facilities/:facilityId
 * Update facility
 */
router.put("/:facilityId", FacilityController.updateFacility);

/**
 * PUT /api/v1/facilities/:facilityId/status
 * Update facility operational status
 */
router.put("/:facilityId/status", FacilityController.updateOperationalStatus);

/**
 * DELETE /api/v1/facilities/:facilityId
 * Delete facility
 */
router.delete("/:facilityId", FacilityController.deleteFacility);

module.exports = router;
