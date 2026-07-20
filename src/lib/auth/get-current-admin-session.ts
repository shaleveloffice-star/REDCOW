import { cookies } from "next/headers";
import { cache } from "react";

import { assertAdminAuthConfigured } from "@/lib/auth/auth-config";
import {
  getAdminSessionCookieName,
  getAdminSessionCookieOptions,
  signAdminSessionToken,
  verifyAdminSessionToken
} from "@/lib/auth/admin-session";
import type { AdminSession } from "@/types/admin";

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
  assertAdminAuthConfigured();

  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
});
