import "server-only";

import { getFirebaseConnectionState } from "@/lib/firebase/config";

export function getFirebaseAdminApp() {
  const state = getFirebaseConnectionState();

  return {
    ...state,
    app: null,
    reason: "Firebase Admin SDK is intentionally not connected in the local phase."
  };
}
