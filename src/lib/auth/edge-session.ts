import { jwtVerify } from "jose";

import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionSecret,
  isEmailAllowedForAdmin,
  getAllowedAdminEmails
} from "@/lib/auth/edge";
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

    if (!email || (role !== "owner" && role !== "manager" && role !== "editor")) {
      return null;
    }

    return { email, role: role as AdminRole, isMock };
  } catch {
    return null;
  }
}

export async function getAdminSessionFromRequestCookie(
  cookieValue: string | undefined
): Promise<AdminSession | null> {
  if (!cookieValue) {
    return null;
  }

  const session = await verifyAdminSessionTokenEdge(cookieValue);
  if (!session) {
    return null;
  }

  if (!isEmailAllowedForAdmin(session.email, getAllowedAdminEmails())) {
    return null;
  }

  return session;
}
