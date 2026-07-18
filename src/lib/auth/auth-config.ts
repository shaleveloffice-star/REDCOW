import { normalizeFirebasePrivateKey } from "@/lib/firebase/private-key";

export type AdminAuthMode = "open" | "mock" | "password" | "firebase";

export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const MIN_DEV_PASSWORD_LENGTH = 12;
const MIN_SESSION_SECRET_LENGTH = 32;

/** Discrete login outcomes — never collapse into a single generic failure. */
export type AdminAuthFailureCode =
  | "invalid_credentials"
  | "forbidden_email"
  | "firebase_error"
  | "config_error"
  | "rate_limited";

export type EnvVarCheck = {
  name: string;
  status: "ok" | "missing" | "invalid";
  /** Safe hint only — never a secret value */
  hint?: string;
};

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

/**
 * Server-safe diagnostics: variable names + ok/missing/invalid only.
 * Never includes secret values.
 */
export function getAdminAuthEnvDiagnostics(): EnvVarCheck[] {
  const mode = getAdminAuthMode();
  const modeRaw = process.env.ADMIN_AUTH_MODE?.trim();

  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  const emails = getAllowedAdminEmails();
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizeFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  const checks: EnvVarCheck[] = [
    {
      name: "ADMIN_AUTH_MODE",
      status: modeRaw ? "ok" : "invalid",
      hint: modeRaw
        ? `resolved=${mode}`
        : `unset; resolved default=${mode} (production should be firebase)`
    },
    {
      name: "ADMIN_SESSION_SECRET",
      status: !secret
        ? "missing"
        : secret.length < MIN_SESSION_SECRET_LENGTH
          ? "invalid"
          : "ok",
      hint:
        !secret
          ? "missing"
          : secret.length < MIN_SESSION_SECRET_LENGTH
            ? `length<${MIN_SESSION_SECRET_LENGTH}`
            : `length>=${MIN_SESSION_SECRET_LENGTH}`
    },
    {
      name: "ADMIN_ALLOWED_EMAILS",
      status: emails.length === 0 ? "missing" : "ok",
      hint: emails.length === 0 ? "empty allowlist" : `count=${emails.length}`
    },
    {
      name: "NEXT_PUBLIC_FIREBASE_API_KEY",
      status: apiKey ? "ok" : "missing"
    },
    {
      name: "FIREBASE_PROJECT_ID",
      status: projectId ? "ok" : "missing"
    },
    {
      name: "FIREBASE_CLIENT_EMAIL",
      status: clientEmail ? "ok" : "missing"
    },
    {
      name: "FIREBASE_PRIVATE_KEY",
      status: !process.env.FIREBASE_PRIVATE_KEY?.trim()
        ? "missing"
        : !privateKey
          ? "invalid"
          : privateKey.includes("BEGIN PRIVATE KEY") ||
              privateKey.includes("BEGIN RSA PRIVATE KEY")
            ? "ok"
            : "invalid",
      hint: !process.env.FIREBASE_PRIVATE_KEY?.trim()
        ? "missing"
        : !privateKey
          ? "normalize failed"
          : privateKey.includes("BEGIN PRIVATE KEY") ||
              privateKey.includes("BEGIN RSA PRIVATE KEY")
            ? "pem_shape_ok"
            : "pem_shape_unexpected"
    }
  ];

  if (clientProjectId && projectId && clientProjectId !== projectId) {
    checks.push({
      name: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      status: "invalid",
      hint: "mismatch with FIREBASE_PROJECT_ID"
    });
  } else if (clientProjectId) {
    checks.push({
      name: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      status: "ok",
      hint: "matches server project id"
    });
  }

  return checks;
}

export function logAdminAuthEnvDiagnostics(reason: string) {
  const checks = getAdminAuthEnvDiagnostics();
  const summary = checks.map((c) => `${c.name}=${c.status}${c.hint ? `(${c.hint})` : ""}`);
  console.error(`[AdminAuth] config diagnostics (${reason}):`, summary.join(", "));
  const failed = checks.filter((c) => c.status !== "ok").map((c) => c.name);
  if (failed.length > 0) {
    console.error(`[AdminAuth] failing env vars: ${failed.join(", ")}`);
  }
}

export function assertProductionAuthMode() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const mode = getAdminAuthMode();

  if (mode === "open") {
    logAdminAuthEnvDiagnostics("open mode blocked");
    throw new Error("Open admin auth is not allowed in production.");
  }

  if (mode === "mock") {
    logAdminAuthEnvDiagnostics("mock mode blocked");
    throw new Error("Mock admin auth is not allowed in production.");
  }

  if (!getAdminSessionSecret()) {
    logAdminAuthEnvDiagnostics("ADMIN_SESSION_SECRET");
    throw new Error(
      "ADMIN_SESSION_SECRET (min 32 characters) is required in production."
    );
  }

  if (getAllowedAdminEmails().length === 0) {
    logAdminAuthEnvDiagnostics("ADMIN_ALLOWED_EMAILS");
    throw new Error("ADMIN_ALLOWED_EMAILS is required in production.");
  }

  if (mode === "firebase") {
    const projectId =
      process.env.FIREBASE_PROJECT_ID?.trim() ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
    if (!projectId || !apiKey) {
      logAdminAuthEnvDiagnostics("Firebase project/API key");
      throw new Error(
        "FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_API_KEY are required when ADMIN_AUTH_MODE=firebase in production."
      );
    }
  }

  if (mode === "password" && !getAdminDevPassword()) {
    logAdminAuthEnvDiagnostics("ADMIN_DEV_PASSWORD");
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
    logAdminAuthEnvDiagnostics("ADMIN_ALLOWED_EMAILS");
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
  if (!secret || secret.length < MIN_SESSION_SECRET_LENGTH) {
    return null;
  }

  return secret;
}
