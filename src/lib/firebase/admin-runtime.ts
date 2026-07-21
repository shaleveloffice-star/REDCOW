import "server-only";

import type { App, Credential } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

import {
  diagnoseFirebasePrivateKey,
  normalizeFirebasePrivateKey
} from "@/lib/firebase/private-key";

type AdminAppModule = {
  cert: (serviceAccount: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  }) => Credential;
  getApps: () => App[];
  initializeApp: (options: { credential: Credential; projectId?: string }) => App;
};

type AdminModules = {
  app: AdminAppModule;
  auth: { getAuth: (app: App) => Auth };
  firestore: { getFirestore: (app: App) => Firestore };
};

export type FirebaseAdminInitState =
  | { status: "ok"; app: App }
  | { status: "missing_env"; missing: string[] }
  | { status: "invalid_private_key"; details: string }
  | { status: "init_failed"; message: string };

let cachedModules: AdminModules | null = null;
let cachedState: FirebaseAdminInitState | undefined;

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

function logSafeAdminEnvPresence() {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const keyDiag = diagnoseFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  console.error("[FirebaseAdmin] env presence", {
    FIREBASE_PROJECT_ID: projectId ? "set" : "missing",
    FIREBASE_CLIENT_EMAIL: clientEmail ? "set" : "missing",
    FIREBASE_PRIVATE_KEY: keyDiag.present ? "set" : "missing",
    privateKeyNormalized: keyDiag.normalized,
    privateKeyHasPemHeader: keyDiag.hasPemHeader,
    privateKeyHasNewlines: keyDiag.hasNewlines,
    privateKeyLineCount: keyDiag.lineCount
  });
}

/** Resolve (and cache) Firebase Admin init outcome with safe diagnostics. */
export async function getFirebaseAdminInitState(): Promise<FirebaseAdminInitState> {
  if (cachedState !== undefined) {
    return cachedState;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = normalizeFirebasePrivateKey(privateKeyRaw);
  const keyDiag = diagnoseFirebasePrivateKey(privateKeyRaw);

  const missing: string[] = [];
  if (!projectId) missing.push("FIREBASE_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");

  if (missing.length > 0) {
    logSafeAdminEnvPresence();
    cachedState = { status: "missing_env", missing };
    console.error("[FirebaseAdmin] missing env vars:", missing.join(", "));
    return cachedState;
  }

  if (!keyDiag.hasPemHeader || !keyDiag.hasNewlines) {
    logSafeAdminEnvPresence();
    cachedState = {
      status: "invalid_private_key",
      details: !keyDiag.hasPemHeader
        ? "FIREBASE_PRIVATE_KEY missing PEM header (BEGIN PRIVATE KEY)"
        : "FIREBASE_PRIVATE_KEY has no newlines after normalize — paste with \\n escapes in Vercel"
    };
    console.error("[FirebaseAdmin] invalid private key shape:", cachedState.details);
    return cachedState;
  }

  try {
    const { app } = loadAdminModules();
    const existing = app.getApps();
    if (existing.length > 0) {
      cachedState = { status: "ok", app: existing[0]! };
      return cachedState;
    }

    const initialized = app.initializeApp({
      credential: app.cert({
        projectId: projectId!,
        clientEmail: clientEmail!,
        privateKey: privateKey!
      }),
      projectId
    });

    cachedState = { status: "ok", app: initialized };
    console.info("[FirebaseAdmin] initializeApp OK");
    return cachedState;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    logSafeAdminEnvPresence();
    cachedState = { status: "init_failed", message };
    console.error("[FirebaseAdmin] initializeApp failed:", message);
    return cachedState;
  }
}

export function formatFirebaseAdminInitError(state: FirebaseAdminInitState): string {
  switch (state.status) {
    case "ok":
      return "";
    case "missing_env":
      return `Firebase Admin missing env: ${state.missing.join(", ")}`;
    case "invalid_private_key":
      return `Firebase Admin private key invalid: ${state.details}`;
    case "init_failed":
      return `Firebase Admin initializeApp failed: ${state.message}`;
    default:
      return "Firebase Admin is not configured";
  }
}

export async function getAdminApp(): Promise<App | null> {
  const state = await getFirebaseAdminInitState();
  return state.status === "ok" ? state.app : null;
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
      "[FirebaseAdmin] Failed to load firebase-admin/auth",
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
      "[FirebaseAdmin] Failed to load firebase-admin/firestore",
      error instanceof Error ? error.message : "error"
    );
    return null;
  }
}
