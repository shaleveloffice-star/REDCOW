import {
  getAllowedAdminEmails,
  isEmailAllowedForAdmin
} from "@/lib/auth/auth-config";
import { resolveAdminRole } from "@/lib/auth/resolve-admin-role";
import type { AdminSession } from "@/types/admin";

type FirebasePasswordSignInResponse = {
  idToken?: string;
  email?: string;
  localId?: string;
  error?: {
    message?: string;
  };
};

export async function authenticateWithFirebase(
  email: string,
  password: string
): Promise<AdminSession | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Firebase API key is missing. Set NEXT_PUBLIC_FIREBASE_API_KEY.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      }),
      cache: "no-store"
    }
  );

  const payload = (await response.json()) as FirebasePasswordSignInResponse;
  const idToken = payload.idToken;

  if (!idToken) {
    return null;
  }

  const { getAdminAuth } = await import("@/lib/firebase/admin-auth");
  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  const decoded = await adminAuth.verifyIdToken(idToken);
  const verifiedEmail = (decoded.email ?? email).trim().toLowerCase();
  const allowedEmails = getAllowedAdminEmails();

  if (!isEmailAllowedForAdmin(verifiedEmail, allowedEmails)) {
    return null;
  }

  return {
    email: verifiedEmail,
    role: await resolveAdminRole(verifiedEmail),
    isMock: false
  };
}
