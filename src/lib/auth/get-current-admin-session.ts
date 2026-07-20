import { cookies } from "next/headers";
import { cache } from "react";

import {
  assertAdminAllowlistConfigured,
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
import type { AdminSession } from "@/types/admin";

function getOpenAdminSession(): AdminSession {
  return {
    email: "admin@nbburger.co.il",
    role: "owner",
    isMock: true
  };
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
  cookieStore.set(getAdminSessionCookieName(), "", {
    ...getAdminSessionCookieOptions(0),
    maxAge: 0
  });
}

/** Deduped per React request — admin pages call this many times in parallel. */
export const getCurrentAdminSession = cache(async (): Promise<AdminSession | null> => {
  assertProductionAuthMode();

  if (isOpenAdminAuthMode()) {
    return getOpenAdminSession();
  }

  assertAdminAllowlistConfigured();

  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  if (!token) {
    return null;
  }

  const session = await verifyAdminSessionToken(token);
  if (!session) {
    return null;
  }

  // Password mode: one shared password, cookie signature is the proof — no allowlist.
  if (getAdminAuthMode() !== "password") {
    const allowedEmails = getAllowedAdminEmails();
    if (!isEmailAllowedForAdmin(session.email, allowedEmails)) {
      return null;
    }
  }

  return session;
});
