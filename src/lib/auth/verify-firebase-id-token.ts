import "server-only";

import { decodeJwt } from "jose";

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

/**
 * Fast path: validate claims from an ID token that was just issued by our
 * server-side Identity Toolkit call. No JWKS network round-trip.
 *
 * Signature trust comes from obtaining the token over HTTPS from Google with
 * our API key in this same request — not from an untrusted client.
 */
export function assertFirebaseIdTokenClaims(
  idToken: string,
  expectedEmail?: string
): VerifiedFirebaseIdToken {
  const projectId = getFirebaseProjectId();
  if (!projectId) {
    throw new Error(
      "FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID is required to verify ID tokens."
    );
  }

  const payload = decodeJwt(idToken);
  const iss = typeof payload.iss === "string" ? payload.iss : "";
  const aud = typeof payload.aud === "string" ? payload.aud : "";
  const exp = typeof payload.exp === "number" ? payload.exp : 0;
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const uid = typeof payload.sub === "string" ? payload.sub : "";

  if (iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error("Firebase ID token issuer mismatch.");
  }

  if (aud !== projectId) {
    throw new Error("Firebase ID token audience mismatch.");
  }

  if (exp * 1000 < Date.now() - 60_000) {
    throw new Error("Firebase ID token expired.");
  }

  if (!email || !uid) {
    throw new Error("Firebase ID token is missing email or sub.");
  }

  if (expectedEmail && email !== expectedEmail.trim().toLowerCase()) {
    throw new Error("Firebase ID token email mismatch.");
  }

  return {
    email,
    uid,
    emailVerified: payload.email_verified === true
  };
}

/** @deprecated Prefer assertFirebaseIdTokenClaims for login hot path */
export async function verifyFirebaseIdToken(
  idToken: string
): Promise<VerifiedFirebaseIdToken> {
  return assertFirebaseIdTokenClaims(idToken);
}
