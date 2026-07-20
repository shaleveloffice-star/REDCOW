/**
 * Edge-only auth helpers for middleware.
 * Do not import firebase-admin, Node built-ins, or server-only modules here.
 */

/** Cookie reaches /admin and /api/admin/* */
export const ADMIN_SESSION_COOKIE = "admin_session_v2";

const MIN_PASSWORD_LENGTH = 6;
const MIN_SESSION_SECRET_LENGTH = 32;

export function getAdminSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < MIN_SESSION_SECRET_LENGTH) {
    return null;
  }
  return secret;
}

export function getAdminPassword(): string | null {
  const password =
    process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_DEV_PASSWORD?.trim();
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return null;
  }
  return password;
}

/** Production config gate for Edge middleware — password + session secret only. */
export function assertEdgeProductionAuthConfig() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!getAdminSessionSecret()) {
    console.error("[AdminAuth] Edge: ADMIN_SESSION_SECRET missing or too short");
    throw new Error("ADMIN_SESSION_SECRET is required.");
  }

  if (!getAdminPassword()) {
    console.error("[AdminAuth] Edge: ADMIN_PASSWORD missing or too short");
    throw new Error("ADMIN_PASSWORD is required.");
  }
}
