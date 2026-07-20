import "server-only";

import { cookies } from "next/headers";

import { assertAdminAuthConfigured } from "@/lib/auth/auth-config";
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
    assertAdminAuthConfigured();

    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminSessionCookieName())?.value;
    if (!token) return null;

    return verifyAdminSessionToken(token);
  } catch (err) {
    console.warn(
      "[getAdminApiSession]",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
