import { getAdminUserByEmail } from "@/repositories/admin.repository";
import type { AdminRole } from "@/types/admin";

/** Least privilege when no active admin user document exists. */
export async function resolveAdminRole(email: string): Promise<AdminRole> {
  const admin = await getAdminUserByEmail(email);
  return admin?.isActive ? admin.role : "editor";
}
