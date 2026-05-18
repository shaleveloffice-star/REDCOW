import { getAdminUserByEmail } from "@/repositories/admin.repository";
import type { AdminSession } from "@/types/admin";

const MOCK_ADMIN_EMAIL = "admin@redcow.local";

export async function loginWithMockCredentials(email: string): Promise<AdminSession | null> {
  const admin = await getAdminUserByEmail(email || MOCK_ADMIN_EMAIL);

  if (!admin || !admin.isActive) {
    return null;
  }

  return {
    email: admin.email,
    role: admin.role,
    isMock: true
  };
}

export async function getCurrentAdminSession(): Promise<AdminSession | null> {
  const admin = await getAdminUserByEmail(MOCK_ADMIN_EMAIL);

  if (!admin || !admin.isActive) {
    return null;
  }

  return {
    email: admin.email,
    role: admin.role,
    isMock: true
  };
}
