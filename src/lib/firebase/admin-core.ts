import { cert, getApps, initializeApp, type App } from "firebase-admin/app";

/**
 * Normalize Vercel/env paste quirks: optional wrapping quotes and literal \n sequences.
 * Does not log the key.
 */
export function normalizeFirebasePrivateKey(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }

  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  key = key.replace(/\\n/g, "\n");
  return key.length > 0 ? key : null;
}

export function getAdminApp(): App | null {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizeFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  if (getApps().length > 0) {
    return getApps()[0] ?? null;
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey })
  });
}

export function isFirebaseAdminConfigured() {
  return getAdminApp() !== null;
}
