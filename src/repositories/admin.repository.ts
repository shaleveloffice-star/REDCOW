import { mockAdminUsers } from "@/data/mock/admin.mock";
import type { AdminUser } from "@/types/admin";

export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  return mockAdminUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}
