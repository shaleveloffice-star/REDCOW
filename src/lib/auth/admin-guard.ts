import "server-only";

import { getCurrentAdminSession } from "@/services/auth.service";

export async function requireAdmin() {
  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Admin access requires an authenticated admin session.");
  }

  return session;
}

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
