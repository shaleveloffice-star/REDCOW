import "server-only";

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
  verifyAdminSessionToken
} from "@/lib/auth/admin-session";
import type { AdminSession } from "@/types/admin";

/**
 * Auth for Route Handlers — must NOT use React cache() (breaks in API routes).
 */
export async function getAdminApiSession(): Promise<AdminSession | null> {
  try {
    assertProductionAuthMode();

    if (isOpenAdminAuthMode()) {
      return { email: "admin@nbburger.co.il", role: "owner", isMock: true };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminSessionCookieName())?.value;
    if (!token) return null;

    const session = await verifyAdminSessionToken(token);
    if (!session) return null;

    if (getAdminAuthMode() !== "password") {
      const allowed = getAllowedAdminEmails();
      if (!isEmailAllowedForAdmin(session.email, allowed)) return null;
    }

    return session;
  } catch (err) {
    console.warn(
      "[getAdminApiSession]",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
