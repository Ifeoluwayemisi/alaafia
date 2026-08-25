/**
 * Consultation Routes
 */

const express = require("express");
const ConsultationController = require("../controllers/consultationController");
const ContractConsultationController = require("../controllers/contractConsultationController");
const multer = require("multer");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * GET /api/v1/consultations
 * List consultations for the authenticated user
 */
router.get("/", ConsultationController.listConsultations);

router.post("/", ContractConsultationController.create);
router.post("/:consultationId/message", ContractConsultationController.message);
router.post(
  "/:consultationId/voice",
  upload.single("audio"),
  ContractConsultationController.voice,
);
router.post(
  "/:consultationId/confirm-transcript",
  ContractConsultationController.confirmTranscript,
);

/**
 * POST /api/v1/consultations/start
 * Initialize a new consultation
 */
router.post("/start", ConsultationController.startConsultation);

/**
 * POST /api/v1/consultations/:consultationId/submit
 * Submit voice/text input and get triage + facility recommendations
 */
router.post(
  "/:consultationId/submit",
  ConsultationController.submitConsultationInput,
);

/**
 * GET /api/v1/consultations/:consultationId
 * Get consultation details
 */
router.get("/:consultationId", ConsultationController.getConsultation);

/**
 * POST /api/v1/consultations/:consultationId/emergency-summary
 * Generate emergency handoff summary
 */
router.post(
  "/:consultationId/emergency-summary",
  ConsultationController.generateEmergencySummary,
);

module.exports = router;
