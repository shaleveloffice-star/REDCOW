import { timingSafeEqual } from "crypto";

import {
  assertProductionAuthMode,
  getAdminAuthMode,
  getAdminDevPassword,
  getAllowedAdminEmails,
  isEmailAllowedForAdmin,
  logAdminAuthEnvDiagnostics,
  type AdminAuthFailureCode
} from "@/lib/auth/auth-config";
import { authenticateWithFirebase } from "@/services/auth-firebase.service";
import { resolveAdminRole } from "@/lib/auth/resolve-admin-role";
import { getAdminUserByEmail } from "@/repositories/admin.repository";
import type { AdminSession } from "@/types/admin";

export {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getCurrentAdminSession
} from "@/lib/auth/get-current-admin-session";

export type AdminLoginResult =
  | { ok: true; session: AdminSession }
  | { ok: false; code: AdminAuthFailureCode };

function safeEqualSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

async function authenticateWithPasswordCredentials(
  email: string,
  password: string
): Promise<AdminLoginResult> {
  const devPassword = getAdminDevPassword();
  if (!devPassword) {
    logAdminAuthEnvDiagnostics("ADMIN_DEV_PASSWORD for password mode");
    return { ok: false, code: "config_error" };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowedEmails = getAllowedAdminEmails();

  if (!isEmailAllowedForAdmin(normalizedEmail, allowedEmails)) {
    return { ok: false, code: "forbidden_email" };
  }

  if (!safeEqualSecret(password, devPassword)) {
    return { ok: false, code: "invalid_credentials" };
  }

  return {
    ok: true,
    session: {
      email: normalizedEmail,
      role: resolveAdminRole(normalizedEmail),
      isMock: false
    }
  };
}

async function authenticateWithMockDevCredentials(email: string): Promise<AdminLoginResult> {
  assertProductionAuthMode();

  const normalizedEmail = email.trim().toLowerCase();
  const admin = await getAdminUserByEmail(normalizedEmail);
  const allowedEmails = getAllowedAdminEmails();
  const emailAllowed =
    allowedEmails.length > 0
      ? isEmailAllowedForAdmin(normalizedEmail, allowedEmails)
      : Boolean(admin?.isActive);

  if (!emailAllowed || !admin?.isActive) {
    return { ok: false, code: "forbidden_email" };
  }

  return {
    ok: true,
    session: {
      email: admin.email,
      role: admin.role,
      isMock: true
    }
  };
}

export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<AdminLoginResult> {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return { ok: false, code: "invalid_credentials" };
  }

  const mode = getAdminAuthMode();

  if (process.env.NODE_ENV === "production" && mode !== "firebase" && mode !== "password") {
    logAdminAuthEnvDiagnostics(`blocked production mode=${mode}`);
    return { ok: false, code: "config_error" };
  }

  if (mode === "firebase") {
    return authenticateWithFirebase(trimmedEmail, trimmedPassword);
  }

  if (mode === "password") {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[AdminAuth] ADMIN_AUTH_MODE=password in production — prefer firebase"
      );
    }
    return authenticateWithPasswordCredentials(trimmedEmail, trimmedPassword);
  }

  return authenticateWithMockDevCredentials(trimmedEmail);
}
