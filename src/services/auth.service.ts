import { cookies } from "next/headers";

import {
  assertProductionAuthMode,
  getAdminAuthMode,
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
import { getAdminAuth } from "@/lib/firebase/admin";
import { getAdminUserByEmail } from "@/repositories/admin.repository";
import type { AdminRole, AdminSession } from "@/types/admin";

type FirebasePasswordSignInResponse = {
  idToken?: string;
  email?: string;
  localId?: string;
  error?: {
    message?: string;
  };
};

async function resolveAdminRole(email: string): Promise<AdminRole> {
  const admin = await getAdminUserByEmail(email);
  return admin?.isActive ? admin.role : "owner";
}

function getOpenAdminSession(): AdminSession {
  return {
    email: "admin@redcow.local",
    role: "owner",
    isMock: true
  };
}

async function authenticateWithFirebase(
  email: string,
  password: string
): Promise<AdminSession | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Firebase API key is missing. Set NEXT_PUBLIC_FIREBASE_API_KEY.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      }),
      cache: "no-store"
    }
  );

  const payload = (await response.json()) as FirebasePasswordSignInResponse;
  const idToken = payload.idToken;

  if (!idToken) {
    return null;
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  const decoded = await adminAuth.verifyIdToken(idToken);
  const verifiedEmail = (decoded.email ?? email).trim().toLowerCase();
  const allowedEmails = getAllowedAdminEmails();

  if (!isEmailAllowedForAdmin(verifiedEmail, allowedEmails)) {
    return null;
  }

  return {
    email: verifiedEmail,
    role: await resolveAdminRole(verifiedEmail),
    isMock: false
  };
}

async function authenticateWithPasswordCredentials(
  email: string
): Promise<AdminSession | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const allowedEmails = getAllowedAdminEmails();

  if (!isEmailAllowedForAdmin(normalizedEmail, allowedEmails)) {
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

    return authenticateWithFirebase(trimmedEmail, trimmedPassword);
  }

  if (getAdminAuthMode() === "password") {
    return authenticateWithPasswordCredentials(trimmedEmail);
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
  if (isOpenAdminAuthMode()) {
    return getOpenAdminSession();
  }

  assertProductionAuthMode();

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

export async function verifyAdminSessionFromToken(token: string): Promise<AdminSession | null> {
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
