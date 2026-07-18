import "server-only";

import type { App } from "firebase-admin/app";

import { normalizeFirebasePrivateKey } from "@/lib/firebase/private-key";

export { normalizeFirebasePrivateKey } from "@/lib/firebase/private-key";

/**
 * Load firebase-admin via dynamic import() only.
 * Static imports are compiled to require() in Next server chunks and break on
 * Vercel with ERR_REQUIRE_ESM (firebase-admin dual CJS/ESM exports).
 */
async function loadAdminAppModule() {
  return import("firebase-admin/app");
}

export async function getAdminApp(): Promise<App | null> {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizeFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    console.error("[AdminAuth] Admin SDK env incomplete", {
      hasProjectId: Boolean(projectId),
      hasClientEmail: Boolean(clientEmail),
      hasPrivateKey: Boolean(privateKey)
    });
    return null;
  }

  try {
    const { cert, getApps, initializeApp } = await loadAdminAppModule();

    if (getApps().length > 0) {
      return getApps()[0] ?? null;
    }

    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey })
    });
  } catch (error) {
    console.error(
      "[AdminAuth] Admin SDK initializeApp failed",
      error instanceof Error ? error.message : "error"
    );
    return null;
  }
}

export async function isFirebaseAdminConfigured(): Promise<boolean> {
  return (await getAdminApp()) !== null;
}
