import { timingSafeEqual } from "crypto";

import { cookies } from "next/headers";

import {
  assertProductionAuthMode,
  getAdminAuthMode,
  getAdminDevPassword,
  getAllowedAdminEmails,
  isEmailAllowedForAdmin,
  isOpenAdminAuthMode
} from "@/lib/auth/auth-config";
import {
  getAdminSessionCookieName,
  getAdminSessionCookieOptions,
  signAdminSessionToken,
  verifyAdminSessionToken
} from "@/lib/auth/admin-session";
import { getAdminUserByEmail } from "@/repositories/admin.repository";
import type { AdminRole, AdminSession } from "@/types/admin";

async function resolveAdminRole(email: string): Promise<AdminRole> {
  const admin = await getAdminUserByEmail(email);
  return admin?.isActive ? admin.role : "owner";
}

function getOpenAdminSession(): AdminSession {
  return {
    email: "admin@nbburger.co.il",
    role: "owner",
    isMock: true
  };
}

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
    throw new Error("ADMIN_DEV_PASSWORD is missing.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowedEmails = getAllowedAdminEmails();

  if (!isEmailAllowedForAdmin(normalizedEmail, allowedEmails)) {
    return null;
  }

  if (!safeEqualSecret(password, devPassword)) {
    return null;
  }

  const admin = await getAdminUserByEmail(normalizedEmail);

  return {
    email: normalizedEmail,
    role: admin?.isActive ? admin.role : "owner",
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

export async function createAdminSessionCookie(session: AdminSession): Promise<boolean> {
  const token = await signAdminSessionToken(session);
  if (!token) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  }

  const cookieStore = await cookies();
  cookieStore.set(getAdminSessionCookieName(), token, getAdminSessionCookieOptions());
  return true;
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(getAdminSessionCookieName());
}

export async function getCurrentAdminSession(): Promise<AdminSession | null> {
  assertProductionAuthMode();

  if (isOpenAdminAuthMode()) {
    return getOpenAdminSession();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  if (!token) {
    return null;
  }

  const session = await verifyAdminSessionToken(token);
  if (!session) {
    return null;
  }

  const allowedEmails = getAllowedAdminEmails();
  if (allowedEmails.length > 0 && !isEmailAllowedForAdmin(session.email, allowedEmails)) {
    return null;
  }

  return session;
}
