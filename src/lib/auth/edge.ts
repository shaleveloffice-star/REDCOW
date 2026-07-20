/**
 * Edge-only auth helpers for middleware.
 * Do not import firebase-admin, Node built-ins, or server-only modules here.
 */

export type AdminAuthMode = "open" | "mock" | "password" | "firebase";

/** v2: path changed from /admin to / so the cookie reaches /api/admin/* too. */
export const ADMIN_SESSION_COOKIE = "admin_session_v2";

const MIN_SESSION_SECRET_LENGTH = 32;

export function getAdminAuthMode(): AdminAuthMode {
  // Local development is always fully open — no login, no cookies, no allowlist.
  if (process.env.NODE_ENV === "development") {
    return "open";
  }

  const mode = process.env.ADMIN_AUTH_MODE?.trim();

  if (mode === "firebase" || mode === "password" || mode === "mock" || mode === "open") {
    return mode;
  }

  return "password";
}

export function isOpenAdminAuthMode() {
  return getAdminAuthMode() === "open";
}

export function getAllowedAdminEmails(): string[] {
  const raw = process.env.ADMIN_ALLOWED_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowedForAdmin(email: string, allowedEmails: string[]) {
  if (allowedEmails.length === 0) {
    return false;
  }

  return allowedEmails.includes(email.trim().toLowerCase());
}

export function getAdminSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < MIN_SESSION_SECRET_LENGTH) {
    return null;
  }

  return secret;
}

/**
 * Production config gate for Edge middleware.
 * Presence checks only — no PEM parsing, no firebase-admin.
 * Login itself verifies ID tokens with jose (does not need Admin SDK at sign-in).
 * Admin credentials are still required for Firestore Admin writes after login.
 */
export function assertEdgeProductionAuthConfig() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const mode = getAdminAuthMode();

  if (mode === "open" || mode === "mock") {
    throw new Error(`${mode} admin auth is not allowed in production.`);
  }

  if (!getAdminSessionSecret()) {
    console.error("[AdminAuth] Edge: ADMIN_SESSION_SECRET missing or too short");
    throw new Error("ADMIN_SESSION_SECRET is required in production.");
  }

  // Password mode uses one shared password — no allowlist required.
  if (mode !== "password" && getAllowedAdminEmails().length === 0) {
    console.error("[AdminAuth] Edge: ADMIN_ALLOWED_EMAILS missing");
    throw new Error("ADMIN_ALLOWED_EMAILS is required in production.");
  }

  if (mode === "firebase") {
    const projectId =
      process.env.FIREBASE_PROJECT_ID?.trim() ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
    if (!projectId || !apiKey) {
      console.error(
        "[AdminAuth] Edge failing env vars:",
        [!projectId ? "FIREBASE_PROJECT_ID" : null, !apiKey ? "NEXT_PUBLIC_FIREBASE_API_KEY" : null]
          .filter(Boolean)
          .join(", ")
      );
      throw new Error(
        "FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_API_KEY are required for firebase auth mode."
      );
    }
  }

  if (mode === "password") {
    const password = process.env.ADMIN_DEV_PASSWORD?.trim();
    if (!password || password.length < 6) {
      console.error("[AdminAuth] Edge: ADMIN_DEV_PASSWORD missing or too short");
      throw new Error("ADMIN_DEV_PASSWORD is required for password mode in production.");
    }
  }
}
