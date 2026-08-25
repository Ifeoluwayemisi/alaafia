const jwt = require("jsonwebtoken");

/**
 * Resolves the acting identity for money-movement endpoints.
 *
 * A valid Bearer JWT always wins over a client-supplied actorId/patientRef,
 * so an authenticated user cannot move or inspect someone else's payments by
 * posting a different id. Guests carry no JWT and keep using their guest
 * session id supplied in the body/query.
 *
 * Returns the verified identity, or null when the caller is unauthenticated.
 */
function resolveVerifiedActorId(req) {
  const header = (req.headers && req.headers.authorization) || "";
  if (!/^Bearer\s+/i.test(header)) return null;
  try {
    const decoded = jwt.verify(header.replace(/^Bearer\s+/i, ""), process.env.JWT_SECRET);
    if (decoded && decoded.sub) return String(decoded.sub);
  } catch (error) {
    // Invalid or expired token: treat as unauthenticated, fall back to body id.
  }
  return null;
}

/**
 * Verified JWT identity takes precedence; otherwise the guest-supplied value
 * is used unchanged so existing guest flows keep working.
 */
function resolveActor(req, fallbackValue = null) {
  const verified = resolveVerifiedActorId(req);
  if (verified) {
    if (fallbackValue && String(fallbackValue) !== verified) {
      console.warn(
        `[auth] client-supplied actor id ignored for authenticated caller`
      );
    }
    return verified;
  }
  return fallbackValue || null;
}

module.exports = { resolveActor, resolveVerifiedActorId };
