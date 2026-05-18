import type { FirebaseConnectionState } from "@/types/firebase";

const requiredClientEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID"
] as const;

const requiredAdminEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY"
] as const;

export function getFirebaseConnectionState(): FirebaseConnectionState {
  const missingEnvVars = [...requiredClientEnvVars, ...requiredAdminEnvVars].filter(
    (key) => !process.env[key]
  );

  return {
    isConfigured: missingEnvVars.length === 0,
    mode: "local",
    missingEnvVars
  };
}

export function getFirebaseClientEnvKeys() {
  return [...requiredClientEnvVars];
}

export function getFirebaseAdminEnvKeys() {
  return [...requiredAdminEnvVars];
}
