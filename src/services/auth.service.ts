import { timingSafeEqual } from "crypto";

import {
  assertProductionAuthMode,
  getAdminAuthMode,
  getAdminDevPassword,
  getAllowedAdminEmails,
  isEmailAllowedForAdmin
} from "@/lib/auth/auth-config";
import { resolveAdminRole } from "@/lib/auth/resolve-admin-role";
import { getAdminUserByEmail } from "@/repositories/admin.repository";
import type { AdminSession } from "@/types/admin";

export {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getCurrentAdminSession
} from "@/lib/auth/get-current-admin-session";

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
): Promise<AdminSession | null> {
  const devPassword = getAdminDevPassword();
  if (!devPassword) {
    throw new Error(
      "ADMIN_DEV_PASSWORD is missing or shorter than 12 characters."
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowedEmails = getAllowedAdminEmails();

  if (!isEmailAllowedForAdmin(normalizedEmail, allowedEmails)) {
    return null;
  }

  if (!safeEqualSecret(password, devPassword)) {
    return null;
  }

  return {
    email: normalizedEmail,
    role: await resolveAdminRole(normalizedEmail),
    isMock: false
  };
}

async function authenticateWithMockDevCredentials(
  email: string
): Promise<AdminSession | null> {
  assertProductionAuthMode();

  const normalizedEmail = email.trim().toLowerCase();
  const admin = await getAdminUserByEmail(normalizedEmail);
  const allowedEmails = getAllowedAdminEmails();
  const emailAllowed =
    allowedEmails.length > 0
      ? isEmailAllowedForAdmin(normalizedEmail, allowedEmails)
      : Boolean(admin?.isActive);

  if (!emailAllowed || !admin?.isActive) {
    return null;
  }

  return {
    email: admin.email,
    role: admin.role,
    isMock: true
  };
}

export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<AdminSession | null> {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail) {
    return null;
  }

  if (getAdminAuthMode() === "firebase") {
    if (!trimmedPassword) {
      return null;
    }

    const { authenticateWithFirebase } = await import("@/services/auth-firebase.service");
    return authenticateWithFirebase(trimmedEmail, trimmedPassword);
  }

  if (getAdminAuthMode() === "password") {
    if (!trimmedPassword) {
      return null;
    }

    return authenticateWithPasswordCredentials(trimmedEmail, trimmedPassword);
  }

  return authenticateWithMockDevCredentials(trimmedEmail);
}
