export type AdminAuthMode = "open" | "mock" | "password" | "firebase";

export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const MIN_DEV_PASSWORD_LENGTH = 12;

export function getAdminAuthMode(): AdminAuthMode {
  const mode = process.env.ADMIN_AUTH_MODE?.trim();

  if (mode === "firebase") {
    return "firebase";
  }

  if (mode === "password") {
    return "password";
  }

  if (mode === "mock") {
    return "mock";
  }

  if (mode === "open") {
    return "open";
  }

  // Safe default: never fall open when ADMIN_AUTH_MODE is unset.
  return "password";
}

export function isOpenAdminAuthMode() {
  return getAdminAuthMode() === "open";
}

export function assertProductionAuthMode() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const mode = getAdminAuthMode();

  if (mode === "open") {
    throw new Error("Open admin auth is not allowed in production.");
  }

  if (mode === "mock") {
    throw new Error("Mock admin auth is not allowed in production.");
  }

  if (!getAdminSessionSecret()) {
    throw new Error(
      "ADMIN_SESSION_SECRET (min 32 characters) is required in production."
    );
  }

  if (getAllowedAdminEmails().length === 0) {
    throw new Error("ADMIN_ALLOWED_EMAILS is required in production.");
  }

  if (mode === "firebase") {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are required when ADMIN_AUTH_MODE=firebase in production."
      );
    }
  }

  if (mode === "password" && !getAdminDevPassword()) {
    throw new Error(
      "ADMIN_DEV_PASSWORD (min 12 characters) is required when ADMIN_AUTH_MODE=password in production. Prefer ADMIN_AUTH_MODE=firebase."
    );
  }
}

/** Password / Firebase modes always require a non-empty allowlist. */
export function assertAdminAllowlistConfigured() {
  if (isOpenAdminAuthMode()) {
    return;
  }

  if (getAllowedAdminEmails().length === 0) {
    throw new Error("ADMIN_ALLOWED_EMAILS must contain at least one email.");
  }
}

export function getAdminDevPassword(): string | null {
  const password = process.env.ADMIN_DEV_PASSWORD?.trim();
  if (!password || password.length < MIN_DEV_PASSWORD_LENGTH) {
    return null;
  }

  return password;
}

export function getSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE_SECONDS;
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
  if (!secret || secret.length < 32) {
    return null;
  }

  return secret;
}
