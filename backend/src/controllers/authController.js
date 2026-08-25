const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { GuestSession, User } = require("../models");
const {
  issueVerificationCode,
  verifyCode,
  sendWelcomeEmail,
} = require("../services/emailVerification");

const JWT_SECRET = process.env.JWT_SECRET || "alafia-development-secret";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  emailVerified: user.emailVerified,
});

const createToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

class AuthController {
  static async createGuest(req, res) {
    const { language = "en-NG", location = {} } = req.body;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await GuestSession.create({
      language,
      latitude: location.latitude,
      longitude: location.longitude,
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      data: { sessionId: session.sessionToken, userType: "GUEST", expiresAt },
      message: "Guest session created",
    });
  }

  static async register(req, res) {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Name, email, and password are required",
          details: [],
        },
      });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: "EMAIL_EXISTS",
          message: "An account with this email already exists",
          details: [],
        },
      });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      passwordHash,
      emailVerified: false,
    });
    const verification = await issueVerificationCode(user);
    const delivery = verification.sent
      ? "EMAIL"
      : verification.developmentCode
        ? "DEVELOPMENT_RESPONSE"
        : "PENDING_RETRY";
    return res.status(202).json({
      success: true,
      data: {
        user: publicUser(user),
        verification: {
          expiresAt: verification.expiresAt,
          delivery,
          ...(delivery === "PENDING_RETRY"
            ? {
                note: "Verification email could not be sent right now. Use POST /api/v1/auth/resend-verification.",
              }
            : {}),
          ...(verification.developmentCode
            ? { developmentCode: verification.developmentCode }
            : {}),
        },
      },
      message: "Account created. Verify your email before logging in.",
    });
  }

  static async verifyEmail(req, res) {
    const { email, code } = req.body;
    const user = await User.findOne({
      where: { email: email?.toLowerCase().trim() },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "Account not found",
          details: [],
        },
      });
    }
    const result = await verifyCode(user.id, code);
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: result.reason,
          message: "Invalid or expired verification code",
          details: [],
        },
      });
    }
    await user.update({ emailVerified: true });
    let welcomeEmailSent = false;
    try {
      const welcomeEmail = await sendWelcomeEmail(user);
      welcomeEmailSent = welcomeEmail.sent;
    } catch (error) {
      console.error("Welcome email could not be sent:", error.message);
    }
    return res.json({
      success: true,
      data: { user: publicUser(user), welcomeEmailSent },
      message: "Email verified successfully",
    });
  }

  static async resendVerification(req, res) {
    const user = await User.findOne({
      where: { email: req.body.email?.toLowerCase().trim() },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "Account not found",
          details: [],
        },
      });
    }
    if (user.emailVerified) {
      return res.status(409).json({
        success: false,
        error: {
          code: "ALREADY_VERIFIED",
          message: "Email is already verified",
          details: [],
        },
      });
    }
    const verification = await issueVerificationCode(user);
    return res.json({
      success: true,
      data: {
        expiresAt: verification.expiresAt,
        ...(verification.developmentCode
          ? { developmentCode: verification.developmentCode }
          : {}),
      },
      message: "Verification code sent",
    });
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
          details: [],
        },
      });
    }
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: "EMAIL_NOT_VERIFIED",
          message: "Verify your email before logging in",
          details: [],
        },
      });
    }
    const token = createToken(user);
    return res.status(200).json({
      success: true,
      data: { user: publicUser(user), token },
      message: "Login successful",
    });
  }

  static async googleLogin(req, res) {
    const { idToken } = req.body;
    if (!idToken || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({
        success: false,
        error: {
          code: "GOOGLE_CONFIG_REQUIRED",
          message: "Google ID token and GOOGLE_CLIENT_ID are required",
          details: [],
        },
      });
    }
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({
        success: false,
        error: {
          code: "GOOGLE_EMAIL_UNVERIFIED",
          message: "Google email is not verified",
          details: [],
        },
      });
    }
    const [user] = await User.findOrCreate({
      where: { email: payload.email.toLowerCase() },
      defaults: {
        name: payload.name || payload.email.split("@")[0],
        email: payload.email.toLowerCase(),
        passwordHash: await bcrypt.hash(
          crypto.randomBytes(32).toString("hex"),
          12,
        ),
        emailVerified: true,
      },
    });
    if (!user.emailVerified) await user.update({ emailVerified: true });
    return res.json({
      success: true,
      data: { user: publicUser(user), token: createToken(user) },
      message: "Google login successful",
    });
  }
}

module.exports = AuthController;
