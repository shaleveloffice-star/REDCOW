/** Minimal admin auth: one shared password + signed session cookie. */

/** Cookie reaches /admin and /api/admin/* */
export const ADMIN_SESSION_COOKIE = "admin_session_v2";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const MIN_PASSWORD_LENGTH = 6;
const MIN_SESSION_SECRET_LENGTH = 32;

export type AdminAuthFailureCode = "invalid_credentials" | "config_error";

export type EnvVarCheck = {
  name: string;
  status: "ok" | "missing" | "invalid";
  hint?: string;
};

/**
 * Server-only admin password.
 * Prefers ADMIN_PASSWORD; falls back to ADMIN_DEV_PASSWORD for migration.
 */
export function getAdminPassword(): string | null {
  const password =
    process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_DEV_PASSWORD?.trim();
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return null;
  }
  return password;
}

export function getAdminSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < MIN_SESSION_SECRET_LENGTH) {
    return null;
  }
  return secret;
}

export function getSessionMaxAgeSeconds() {
  return SESSION_MAX_AGE_SECONDS;
}

export function getAdminAuthEnvDiagnostics(): EnvVarCheck[] {
  const password =
    process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_DEV_PASSWORD?.trim() || "";
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || "";

  return [
    {
      name: "ADMIN_PASSWORD",
      status: !password
        ? "missing"
        : password.length < MIN_PASSWORD_LENGTH
          ? "invalid"
          : "ok",
      hint: !password
        ? "set ADMIN_PASSWORD (server-only)"
        : password.length < MIN_PASSWORD_LENGTH
          ? `length<${MIN_PASSWORD_LENGTH}`
          : process.env.ADMIN_PASSWORD?.trim()
            ? "set"
            : "using ADMIN_DEV_PASSWORD fallback — rename to ADMIN_PASSWORD"
    },
    {
      name: "ADMIN_SESSION_SECRET",
      status: !secret
        ? "missing"
        : secret.length < MIN_SESSION_SECRET_LENGTH
          ? "invalid"
          : "ok",
      hint: !secret
        ? "missing"
        : secret.length < MIN_SESSION_SECRET_LENGTH
          ? `length<${MIN_SESSION_SECRET_LENGTH}`
          : `length>=${MIN_SESSION_SECRET_LENGTH}`
    }
  ];
}

export function logAdminAuthEnvDiagnostics(reason: string) {
  const checks = getAdminAuthEnvDiagnostics();
  const summary = checks.map((c) => `${c.name}=${c.status}${c.hint ? `(${c.hint})` : ""}`);
  const failed = checks.filter((c) => c.status !== "ok").map((c) => c.name);
  const log = process.env.NODE_ENV === "production" ? console.error : console.warn;
  log(`[AdminAuth] config diagnostics (${reason}):`, summary.join(", "));
  if (failed.length > 0) {
    log(`[AdminAuth] failing env vars: ${failed.join(", ")}`);
  }
}

/** Require password + session secret in production. */
export function assertAdminAuthConfigured() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!getAdminSessionSecret()) {
    logAdminAuthEnvDiagnostics("ADMIN_SESSION_SECRET");
    throw new Error(
      "ADMIN_SESSION_SECRET (min 32 characters) is required."
    );
  }

  if (!getAdminPassword()) {
    logAdminAuthEnvDiagnostics("ADMIN_PASSWORD");
    throw new Error("ADMIN_PASSWORD (min 6 characters) is required.");
  }
}

/** @deprecated Use assertAdminAuthConfigured — kept for call-site compatibility. */
export function assertProductionAuthMode() {
  assertAdminAuthConfigured();
}

/** @deprecated No-op — allowlist removed. */
export function assertAdminAllowlistConfigured() {
  // Password auth does not use an email allowlist.
}
