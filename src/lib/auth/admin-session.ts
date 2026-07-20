import { SignJWT, jwtVerify } from "jose";

import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionSecret,
  getSessionMaxAgeSeconds
} from "@/lib/auth/auth-config";
import type { AdminRole, AdminSession } from "@/types/admin";

type AdminSessionPayload = {
  email: string;
  role: AdminRole;
  isMock: boolean;
  jti: string;
};

function getSecretKey() {
  const secret = getAdminSessionSecret();
  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

export async function signAdminSessionToken(session: AdminSession): Promise<string | null> {
  const secretKey = getSecretKey();
  if (!secretKey) {
    return null;
  }

  const jti = globalThis.crypto.randomUUID();

  return new SignJWT({
    email: session.email,
    role: session.role,
    isMock: session.isMock,
    jti
  } satisfies AdminSessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(jti)
    .setExpirationTime(`${getSessionMaxAgeSeconds()}s`)
    .sign(secretKey);
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSession | null> {
  const secretKey = getSecretKey();
  if (!secretKey) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"]
    });

    const email = typeof payload.email === "string" ? payload.email : "";
    const role = payload.role;
    const isMock = payload.isMock === true;

    if (!email || (role !== "owner" && role !== "manager" && role !== "editor")) {
      return null;
    }

    return { email, role, isMock };
  } catch {
    return null;
  }
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}

export function getAdminSessionCookieOptions(maxAge = getSessionMaxAgeSeconds()) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    // Must be "/" so the cookie also reaches /api/admin/* (image upload API).
    path: "/",
    maxAge
  };
}
