import { mockAdminUsers } from "@/data/mock/admin.mock";
import type { AdminRole } from "@/types/admin";

/**
 * Sync role lookup for login hot path (no I/O).
 * Known mock admin → that role; other allowlisted Firebase users → owner.
 */
export function resolveAdminRole(email: string): AdminRole {
  const normalized = email.trim().toLowerCase();
  const admin = mockAdminUsers.find(
    (user) => user.email.toLowerCase() === normalized && user.isActive
  );
  return admin?.role ?? "owner";
}
