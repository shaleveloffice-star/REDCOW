import { jwtVerify } from "jose";

import { ADMIN_SESSION_COOKIE, getAdminSessionSecret, getAdminPassword } from "@/lib/auth/edge";
import type { AdminRole, AdminSession } from "@/types/admin";

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}

export async function verifyAdminSessionTokenEdge(
  token: string
): Promise<AdminSession | null> {
  const secret = getAdminSessionSecret();
  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"]
    });

    const email = typeof payload.email === "string" ? payload.email : "";
    const role = payload.role;
    const isMock = payload.isMock === true;
    const password = getAdminPassword();
    if (!password) return null;
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    const expectedVersion = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("").slice(0, 16);
    if (payload.authVersion !== expectedVersion) return null;

    if (!email || (role !== "owner" && role !== "manager" && role !== "editor")) {
      return null;
    }

    return { email, role: role as AdminRole, isMock };
  } catch {
    return null;
  }
}

/** Valid signed cookie = authenticated admin (no email allowlist). */
export async function getAdminSessionFromRequestCookie(
  cookieValue: string | undefined
): Promise<AdminSession | null> {
  if (!cookieValue) {
    return null;
  }

  return verifyAdminSessionTokenEdge(cookieValue);
}
