import "server-only";

export {
  getAdminApp,
  getAdminAuth,
  getAdminFirestore,
  isFirebaseAdminConfigured,
  normalizeFirebasePrivateKey
} from "@/lib/firebase/admin-runtime";
