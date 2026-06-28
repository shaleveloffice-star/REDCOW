import { getAuth, type Auth } from "firebase-admin/auth";

import { getAdminApp } from "@/lib/firebase/admin-core";

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}
