import "server-only";

import { assertAdminAuthConfigured } from "@/lib/auth/auth-config";
import { getCurrentAdminSession } from "@/lib/auth/get-current-admin-session";
import type { AdminRole } from "@/types/admin";

export async function requireAdmin() {
  assertAdminAuthConfigured();

  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Admin access requires an authenticated admin session.");
  }

  return session;
}

export async function requireAdminRole(allowedRoles: readonly AdminRole[]) {
  const session = await requireAdmin();

  if (!allowedRoles.includes(session.role)) {
    throw new Error("Insufficient admin permissions for this action.");
  }

  return session;
}
