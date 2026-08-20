const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/v1/auth/signup
router.post("/signup", authController.signup);

// POST /api/v1/auth/verify
router.post("/verify", authController.verify);

// POST /api/v1/auth/signin
router.post("/signin", authController.signin);

// POST /api/v1/auth/resend-code
router.post("/resend-code", authController.resendCode);

module.exports = router;
