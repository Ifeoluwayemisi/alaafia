// In-memory user store for development/demo (persists during server runtime)
const usersStore = new Map();
const verificationCodes = new Map();

// Seed a default demo user for instant sign-in testing
usersStore.set("user@example.com", {
  id: "user-existing-1",
  firstName: "Demo",
  lastName: "User",
  email: "user@example.com",
  password: "password123", // demo plain password check
  isVerified: true,
  isNewUser: false,
  createdAt: new Date().toISOString(),
});

/**
 * Mask email for privacy: e.g. "rukayat@gmail.com" -> "r******@gmail.com"
 */
function maskEmail(email) {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name[0]}*@${domain}`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
}

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register new user & issue 6-digit verification code
 */
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (First Name, Last Name, Email, Password).",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists and is already verified
    const existingUser = usersStore.get(cleanEmail);
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please sign in instead.",
      });
    }

    // Generate 6-digit numeric OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save pending user
    const newUser = {
      id: `user-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: cleanEmail,
      password: password,
      isVerified: false,
      isNewUser: true,
      createdAt: new Date().toISOString(),
    };

    usersStore.set(cleanEmail, newUser);
    verificationCodes.set(cleanEmail, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    console.log(`\n========================================`);
    console.log(`✉️  VERIFICATION CODE FOR ${cleanEmail}: ${code}`);
    console.log(`========================================\n`);

    return res.status(201).json({
      success: true,
      message: "Account created successfully! Verification code sent to email.",
      email: cleanEmail,
      maskedEmail: maskEmail(cleanEmail),
      verificationCode: code, // returned for seamless testing/dev
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration. Please try again.",
    });
  }
};

/**
 * @route   POST /api/v1/auth/verify
 * @desc    Verify 6-digit code and activate new user account
 */
exports.verify = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and 6-digit verification code are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const storedOTP = verificationCodes.get(cleanEmail);
    const user = usersStore.get(cleanEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email. Please sign up.",
      });
    }

    // Allow master code '123456' for ultra-easy testing or stored code match
    const isValidCode = (storedOTP && storedOTP.code === code.trim()) || code.trim() === "123456";

    if (!isValidCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email or enter 123456 for testing.",
      });
    }

    if (storedOTP && Date.now() > storedOTP.expiresAt && code.trim() !== "123456") {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // Activate user
    user.isVerified = true;
    user.isNewUser = true; // First time after verification = NEW USER
    usersStore.set(cleanEmail, user);
    verificationCodes.delete(cleanEmail);

    return res.status(200).json({
      success: true,
      message: "Account verified successfully! Welcome to Alaafia.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: true,
        isNewUser: true,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during verification.",
    });
  }
};

/**
 * @route   POST /api/v1/auth/signin
 * @desc    Sign in existing user
 */
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email address and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = usersStore.get(cleanEmail);

    // If user not in store, create/allow demo sign-in for seamless dev testing
    if (!user) {
      const emailPrefix = cleanEmail.split("@")[0];
      const parsedName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      user = {
        id: `user-${Date.now()}`,
        firstName: parsedName,
        lastName: "User",
        email: cleanEmail,
        password: password,
        isVerified: true,
        isNewUser: false, // Returning/existing user
        createdAt: new Date().toISOString(),
      };
      usersStore.set(cleanEmail, user);
    }

    if (user.password && user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    if (!user.isVerified) {
      // Re-generate OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      verificationCodes.set(cleanEmail, {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: "Your account is not verified yet. A verification code has been sent to your email.",
        email: cleanEmail,
        maskedEmail: maskEmail(cleanEmail),
        verificationCode: code,
      });
    }

    // Existing user signing in -> isNewUser is false (they have an established profile)
    user.isNewUser = false;
    usersStore.set(cleanEmail, user);

    return res.status(200).json({
      success: true,
      message: "Signed in successfully!",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: true,
        isNewUser: false,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during sign in.",
    });
  }
};

/**
 * @route   POST /api/v1/auth/resend-code
 * @desc    Resend 6-digit verification code
 */
exports.resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    verificationCodes.set(cleanEmail, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log(`\n========================================`);
    console.log(`✉️  RESENT VERIFICATION CODE FOR ${cleanEmail}: ${code}`);
    console.log(`========================================\n`);

    return res.status(200).json({
      success: true,
      message: "New verification code sent to your email.",
      maskedEmail: maskEmail(cleanEmail),
      verificationCode: code,
    });
  } catch (error) {
    console.error("Resend code error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification code.",
    });
  }
};
