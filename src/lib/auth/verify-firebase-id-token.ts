import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Verify Firebase Auth ID tokens without firebase-admin.
 * Avoids Vercel ERR_REQUIRE_ESM when loading firebase-admin/auth.
 *
 * Spec: https://firebase.google.com/docs/auth/admin/verify-id-tokens
 */
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export type VerifiedFirebaseIdToken = {
  email: string;
  uid: string;
  emailVerified: boolean;
};

function getFirebaseProjectId(): string | null {
  return (
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    null
  );
}

export async function verifyFirebaseIdToken(
  idToken: string
): Promise<VerifiedFirebaseIdToken> {
  const projectId = getFirebaseProjectId();
  if (!projectId) {
    throw new Error(
      "FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID is required to verify ID tokens."
    );
  }

  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"]
  });

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const uid = typeof payload.sub === "string" ? payload.sub : "";

  if (!email || !uid) {
    throw new Error("Firebase ID token is missing email or sub.");
  }

  return {
    email,
    uid,
    emailVerified: payload.email_verified === true
  };
}
