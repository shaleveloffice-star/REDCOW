import { timingSafeEqual } from "crypto";

import {
  getAdminPassword,
  logAdminAuthEnvDiagnostics,
  type AdminAuthFailureCode
} from "@/lib/auth/auth-config";
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

/** One shared admin password — no email, Firebase Auth, or allowlist. */
export async function loginWithAdminPassword(
  password: string
): Promise<AdminLoginResult> {
  const trimmedPassword = password.trim();
  if (!trimmedPassword) {
    return { ok: false, code: "invalid_credentials" };
  }

  const expected = getAdminPassword();
  if (!expected) {
    logAdminAuthEnvDiagnostics("ADMIN_PASSWORD missing");
    return { ok: false, code: "config_error" };
  }

  if (!safeEqualSecret(trimmedPassword, expected)) {
    return { ok: false, code: "invalid_credentials" };
  }

  return {
    ok: true,
    session: {
      email: "admin@nbburger.co.il",
      role: "owner",
      isMock: false
    }
  };
}

/** @deprecated Use loginWithAdminPassword */
export async function loginWithEmailPassword(
  _email: string,
  password: string
): Promise<AdminLoginResult> {
  return loginWithAdminPassword(password);
}
