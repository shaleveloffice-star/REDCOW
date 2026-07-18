import "server-only";

import type { Auth } from "firebase-admin/auth";

import { getAdminApp } from "@/lib/firebase/admin-core";

export async function getAdminAuth(): Promise<Auth | null> {
  const app = await getAdminApp();
  if (!app) {
    return null;
  }

  try {
    const { getAuth } = await import("firebase-admin/auth");
    return getAuth(app);
  } catch (error) {
    console.error(
      "[AdminAuth] Failed to load firebase-admin/auth",
      error instanceof Error ? error.message : "error"
    );
    return null;
  }
}
