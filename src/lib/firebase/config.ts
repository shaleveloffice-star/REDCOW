import {
  getFirebaseMissingEnvKeys,
  getFirebaseRequiredEnvKeys,
  isFirebaseConfigured
} from "@/lib/firebase";
import type { FirebaseConnectionState } from "@/types/firebase";

const requiredAdminEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY"
] as const;

export function getFirebaseConnectionState(): FirebaseConnectionState {
  const missingClientEnvVars = getFirebaseMissingEnvKeys();
  const missingAdminEnvVars = requiredAdminEnvVars.filter((key) => !process.env[key]);
  const missingEnvVars = [...missingClientEnvVars, ...missingAdminEnvVars];

  return {
    isConfigured: isFirebaseConfigured(),
    mode: isFirebaseConfigured() ? "firebase" : "local",
    missingEnvVars
  };
}

export function getFirebaseClientEnvKeys() {
  return getFirebaseRequiredEnvKeys();
}

export function getFirebaseAdminEnvKeys() {
  return [...requiredAdminEnvVars];
}
