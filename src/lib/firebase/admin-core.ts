import { cert, getApps, initializeApp, type App } from "firebase-admin/app";

import { normalizeFirebasePrivateKey } from "@/lib/firebase/private-key";

export { normalizeFirebasePrivateKey } from "@/lib/firebase/private-key";

export function getAdminApp(): App | null {
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

  if (getApps().length > 0) {
    return getApps()[0] ?? null;
  }

  try {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey })
    });
  } catch (error) {
    console.error(
      "[AdminAuth] Admin SDK initializeApp/cert failed",
      error instanceof Error ? error.message : "error"
    );
    return null;
  }
}

export function isFirebaseAdminConfigured() {
  return getAdminApp() !== null;
}
