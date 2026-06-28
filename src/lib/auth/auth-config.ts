export type AdminAuthMode = "open" | "mock" | "password" | "firebase";

export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getAdminAuthMode(): AdminAuthMode {
  const mode = process.env.ADMIN_AUTH_MODE ?? "open";

  if (mode === "firebase") {
    return "firebase";
  }

  if (mode === "password") {
    return "password";
  }

  if (mode === "mock") {
    return "mock";
  }

  return "open";
}

export function isOpenAdminAuthMode() {
  return getAdminAuthMode() === "open";
}

export function assertProductionAuthMode() {
  if (process.env.NODE_ENV === "production" && getAdminAuthMode() === "mock") {
    throw new Error("Mock admin auth is not allowed in production");
  }
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
