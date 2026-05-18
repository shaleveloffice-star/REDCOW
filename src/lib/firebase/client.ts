import { getFirebaseConnectionState } from "@/lib/firebase/config";

export function getFirebaseClientApp() {
  const state = getFirebaseConnectionState();

  return {
    ...state,
    app: null,
    reason: "Firebase client SDK is intentionally not connected in the local phase."
  };
}
