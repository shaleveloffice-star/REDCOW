/**
 * Edge-only auth helpers for middleware.
 * Do not import firebase-admin, Node built-ins, or server-only modules here.
 */

export type AdminAuthMode = "open" | "mock" | "password" | "firebase";

export const ADMIN_SESSION_COOKIE = "admin_session";

const MIN_SESSION_SECRET_LENGTH = 32;

export function getAdminAuthMode(): AdminAuthMode {
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

  if (getAllowedAdminEmails().length === 0) {
    console.error("[AdminAuth] Edge: ADMIN_ALLOWED_EMAILS missing");
    throw new Error("ADMIN_ALLOWED_EMAILS is required in production.");
  }

  if (mode === "firebase") {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
    if (!projectId || !clientEmail || !privateKey) {
      console.error(
        "[AdminAuth] Edge failing env vars:",
        [
          !projectId ? "FIREBASE_PROJECT_ID" : null,
          !clientEmail ? "FIREBASE_CLIENT_EMAIL" : null,
          !privateKey ? "FIREBASE_PRIVATE_KEY" : null
        ]
          .filter(Boolean)
          .join(", ")
      );
      throw new Error("Firebase Admin credentials are required for firebase auth mode.");
    }
  }

  if (mode === "password") {
    const password = process.env.ADMIN_DEV_PASSWORD?.trim();
    if (!password || password.length < 12) {
      console.error("[AdminAuth] Edge: ADMIN_DEV_PASSWORD missing or too short");
      throw new Error("ADMIN_DEV_PASSWORD is required for password mode in production.");
    }
  }
}
