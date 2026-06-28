import "server-only";

import { getCurrentAdminSession } from "@/services/auth.service";

export async function requireAdmin() {
  const authMode = process.env.ADMIN_AUTH_MODE ?? "mock";

  if (process.env.NODE_ENV === "production" && authMode === "mock") {
    throw new Error("Mock admin auth is not allowed in production");
  }

  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Admin access requires an authenticated admin session.");
  }

  return session;
}

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
