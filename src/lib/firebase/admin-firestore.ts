import "server-only";

import type { Firestore } from "firebase-admin/firestore";

import { getAdminApp } from "@/lib/firebase/admin-core";

export async function getAdminFirestore(): Promise<Firestore | null> {
  const app = await getAdminApp();
  if (!app) {
    return null;
  }

  try {
    const { getFirestore } = await import("firebase-admin/firestore");
    return getFirestore(app);
  } catch (error) {
    console.error(
      "[AdminAuth] Failed to load firebase-admin/firestore",
      error instanceof Error ? error.message : "error"
    );
    return null;
  }
}
