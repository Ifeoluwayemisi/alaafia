const express = require("express");
const AuthController = require("../controllers/authController");

const router = express.Router();
router.post("/guest", AuthController.createGuest);
router.post("/register", AuthController.register);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerification);
router.post("/login", AuthController.login);
router.post("/google", AuthController.googleLogin);

module.exports = router;
