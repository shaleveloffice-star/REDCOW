import { cert, getApps, initializeApp, type App } from "firebase-admin/app";

export function getAdminApp(): App | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

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
