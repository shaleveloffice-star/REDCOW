import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { getAdminApp } from "@/lib/firebase/admin-core";

export function getAdminFirestore(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}
