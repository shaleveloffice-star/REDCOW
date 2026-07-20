import "server-only";

import type { App, Credential } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

import { normalizeFirebasePrivateKey } from "@/lib/firebase/private-key";

type AdminAppModule = {
  cert: (serviceAccount: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  }) => Credential;
  getApps: () => App[];
  initializeApp: (options: { credential: Credential; storageBucket?: string }) => App;
};

type AdminModules = {
  app: AdminAppModule;
  auth: { getAuth: (app: App) => Auth };
  firestore: { getFirestore: (app: App) => Firestore };
};

let cachedModules: AdminModules | null = null;
let cachedApp: App | null | undefined;

function loadAdminModules(): AdminModules {
  if (cachedModules) {
    return cachedModules;
  }

  // Sibling .cjs uses Node's CJS export condition (avoids ERR_REQUIRE_ESM).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  cachedModules = require("./firebase-admin.cjs") as AdminModules;
  return cachedModules;
}

export { normalizeFirebasePrivateKey } from "@/lib/firebase/private-key";

export async function getAdminApp(): Promise<App | null> {
  if (cachedApp !== undefined) {
    return cachedApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizeFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    console.error("[AdminAuth] Admin SDK env incomplete", {
      hasProjectId: Boolean(projectId),
      hasClientEmail: Boolean(clientEmail),
      hasPrivateKey: Boolean(privateKey)
    });
    cachedApp = null;
    return null;
  }

  try {
    const { app } = loadAdminModules();
    const existing = app.getApps();
    if (existing.length > 0) {
      cachedApp = existing[0] ?? null;
      return cachedApp;
    }

    const storageBucket =
      process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

    cachedApp = app.initializeApp({
      credential: app.cert({ projectId, clientEmail, privateKey }),
      ...(storageBucket ? { storageBucket } : {})
    });
    return cachedApp;
  } catch (error) {
    console.error(
      "[AdminAuth] Admin SDK initializeApp failed",
      error instanceof Error ? error.message : "error"
    );
    cachedApp = null;
    return null;
  }
}

export async function isFirebaseAdminConfigured(): Promise<boolean> {
  return (await getAdminApp()) !== null;
}

export async function getAdminAuth(): Promise<Auth | null> {
  const appInstance = await getAdminApp();
  if (!appInstance) {
    return null;
  }

  try {
    const { auth } = loadAdminModules();
    return auth.getAuth(appInstance);
  } catch (error) {
    console.error(
      "[AdminAuth] Failed to load firebase-admin/auth",
      error instanceof Error ? error.message : "error"
    );
    return null;
  }
}

export async function getAdminFirestore(): Promise<Firestore | null> {
  const appInstance = await getAdminApp();
  if (!appInstance) {
    return null;
  }

  try {
    const { firestore } = loadAdminModules();
    return firestore.getFirestore(appInstance);
  } catch (error) {
    console.error(
      "[AdminAuth] Failed to load firebase-admin/firestore",
      error instanceof Error ? error.message : "error"
    );
    return null;
  }
}
