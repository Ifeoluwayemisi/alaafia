const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dns = require("dns");
const { EmailVerificationCode } = require("../models");

const CODE_TTL_MINUTES = 10;

const hashCode = (code) =>
  crypto.createHash("sha256").update(code).digest("hex");

const generateCode = () => crypto.randomInt(100000, 1000000).toString();

const getTransporter = async () => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  // Railway containers cannot route IPv6, and resolver-level hints
  // (family option, --dns-result-order) have proven unreliable through
  // nodemailer's socket layer. Resolve to a literal IPv4 address ourselves;
  // the hostname survives only as tls.servername so certificate validation
  // still matches the real server.
  let ipv4;
  try {
    const resolved = await dns.promises.lookup(process.env.SMTP_HOST, { family: 4 });
    ipv4 = resolved.address;
  } catch (error) {
    console.error(
      `[email] SMTP host has no IPv4 record host=${process.env.SMTP_HOST} code=${error.code || "UNKNOWN"}`
    );
    return null;
  }

  return nodemailer.createTransport({
    host: ipv4,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    family: 4,
    // Fail fast so account creation never hangs on an unreachable relay.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      servername: process.env.SMTP_HOST,
    },
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendViaBrevo = async ({ to, subject, text, html }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.EMAIL_FROM_NAME || "ALAFIA",
        email: process.env.EMAIL_SENDER,
      },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });
  if (!response.ok) {
    const err = new Error(`Brevo API responded ${response.status}`);
    err.responseCode = response.status;
    throw err;
  }
};

/**
 * Delivery dispatch: Brevo HTTP API first (works over port 443 where PaaS
 * egress is unrestricted; SMTP ports are commonly filtered), then classic
 * SMTP for environments that have it configured (e.g. local development).
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (process.env.BREVO_API_KEY) {
    await sendViaBrevo({ to, subject, text, html });
    return { provider: "BREVO" };
  }
  const transporter = await getTransporter();
  if (!transporter) {
    return null;
  }
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text, html });
  return { provider: "SMTP" };
};

const issueVerificationCode = async (user) => {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await EmailVerificationCode.update(
    { usedAt: new Date() },
    { where: { userId: user.id, usedAt: null } },
  );
  await EmailVerificationCode.create({
    userId: user.id,
    codeHash: hashCode(code),
    expiresAt,
  });

  let sent = false;
  try {
    const outcome = await sendEmail({
      to: user.email,
      subject: "Your ALAFIA verification code",
      text: `Your ALAFIA verification code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes.`,
      html: `<p>Your ALAFIA verification code is <strong>${code}</strong>.</p><p>It expires in ${CODE_TTL_MINUTES} minutes.</p>`,
    });
    sent = Boolean(outcome);
  } catch (error) {
    // The account exists and the code is stored; a delivery hiccup must not
    // surface as a 500 or leak provider internals. The client can recover via
    // POST /api/v1/auth/resend-verification.
    console.error(
      `[email] verification code delivery failed providerCode=${error.code || error.responseCode || "UNKNOWN"} detail=${error.message ? String(error.message).slice(0, 120) : "none"}`
    );
    sent = false;
  }

  return {
    expiresAt,
    developmentCode: process.env.NODE_ENV === "development" ? code : undefined,
    sent,
  };
};

const sendWelcomeEmail = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: "Welcome to ALAFIA",
      text: `Welcome to ALAFIA, ${user.name}! Your email has been verified. ALAFIA helps you understand health urgency and find the right next step.`,
      html: `<p>Welcome to ALAFIA, ${user.name}!</p><p>Your email has been verified successfully.</p><p>ALAFIA helps you understand health urgency and find the right next step.</p>`,
    });
    return { sent: true };
  } catch (error) {
    console.error(
      `[email] welcome email delivery failed providerCode=${error.code || error.responseCode || "UNKNOWN"} detail=${error.message ? String(error.message).slice(0, 120) : "none"}`
    );
    return { sent: false, reason: "EMAIL_SEND_FAILED" };
  }
};

const verifyCode = async (userId, code) => {
  const record = await EmailVerificationCode.findOne({
    where: { userId, usedAt: null },
    order: [["createdAt", "DESC"]],
  });

  if (!record || record.expiresAt <= new Date()) {
    return { valid: false, reason: "CODE_EXPIRED_OR_MISSING" };
  }

  if (record.attempts >= 5) {
    return { valid: false, reason: "TOO_MANY_ATTEMPTS" };
  }

  await record.increment("attempts");
  if (hashCode(String(code)) !== record.codeHash) {
    return { valid: false, reason: "INVALID_CODE" };
  }

  await record.update({ usedAt: new Date() });
  return { valid: true };
};

module.exports = { issueVerificationCode, verifyCode, sendWelcomeEmail };
