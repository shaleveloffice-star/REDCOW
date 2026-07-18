import {
  getAllowedAdminEmails,
  isEmailAllowedForAdmin,
  logAdminAuthEnvDiagnostics,
  type AdminAuthFailureCode
} from "@/lib/auth/auth-config";
import { verifyFirebaseIdToken } from "@/lib/auth/verify-firebase-id-token";
import { resolveAdminRole } from "@/lib/auth/resolve-admin-role";
import type { AdminSession } from "@/types/admin";

type FirebasePasswordSignInResponse = {
  idToken?: string;
  email?: string;
  localId?: string;
  error?: {
    message?: string;
    errors?: Array<{ message?: string }>;
  };
};

export type FirebaseAuthResult =
  | { ok: true; session: AdminSession }
  | { ok: false; code: AdminAuthFailureCode };

const INVALID_CREDENTIAL_MESSAGES = new Set([
  "EMAIL_NOT_FOUND",
  "INVALID_PASSWORD",
  "INVALID_LOGIN_CREDENTIALS",
  "USER_DISABLED",
  "INVALID_EMAIL"
]);

function firebaseErrorMessage(payload: FirebasePasswordSignInResponse): string {
  return (
    payload.error?.message?.trim() ||
    payload.error?.errors?.[0]?.message?.trim() ||
    "UNKNOWN"
  );
}

function mapFirebaseIdentityError(message: string): AdminAuthFailureCode {
  const code = message.split(" ")[0] ?? message;
  if (INVALID_CREDENTIAL_MESSAGES.has(code) || INVALID_CREDENTIAL_MESSAGES.has(message)) {
    return "invalid_credentials";
  }
  return "firebase_error";
}

/**
 * Admin login via Identity Toolkit REST + jose JWT verify.
 * Does not import firebase-admin (avoids ERR_REQUIRE_ESM on Vercel).
 */
export async function authenticateWithFirebase(
  email: string,
  password: string
): Promise<FirebaseAuthResult> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) {
    logAdminAuthEnvDiagnostics("NEXT_PUBLIC_FIREBASE_API_KEY missing at login");
    return { ok: false, code: "config_error" };
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    logAdminAuthEnvDiagnostics("FIREBASE_PROJECT_ID missing at login");
    return { ok: false, code: "config_error" };
  }

  let response: Response;
  try {
    response = await fetch(
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
  } catch (error) {
    console.error(
      "[AdminAuth] Identity Toolkit network error",
      error instanceof Error ? error.message : "error"
    );
    return { ok: false, code: "firebase_error" };
  }

  let payload: FirebasePasswordSignInResponse;
  try {
    payload = (await response.json()) as FirebasePasswordSignInResponse;
  } catch {
    console.error("[AdminAuth] Identity Toolkit returned non-JSON", {
      status: response.status,
      ok: response.ok
    });
    return { ok: false, code: "firebase_error" };
  }

  const idToken = payload.idToken;
  if (!idToken) {
    const firebaseMessage = firebaseErrorMessage(payload);
    const code = mapFirebaseIdentityError(firebaseMessage);
    console.error("[AdminAuth] Identity Toolkit sign-in failed", {
      httpStatus: response.status,
      responseOk: response.ok,
      firebaseCode: firebaseMessage.split(" ")[0] ?? firebaseMessage
    });
    return { ok: false, code };
  }

  let verifiedEmail: string;
  try {
    const verified = await verifyFirebaseIdToken(idToken);
    verifiedEmail = verified.email;
  } catch (error) {
    console.error(
      "[AdminAuth] ID token verify failed (jose)",
      error instanceof Error ? error.message : "error"
    );
    logAdminAuthEnvDiagnostics("ID token verify failed");
    return { ok: false, code: "config_error" };
  }

  const allowedEmails = getAllowedAdminEmails();
  if (!isEmailAllowedForAdmin(verifiedEmail, allowedEmails)) {
    console.error("[AdminAuth] allowlist rejected email after Firebase success", {
      allowlistCount: allowedEmails.length
    });
    return { ok: false, code: "forbidden_email" };
  }

  return {
    ok: true,
    session: {
      email: verifiedEmail,
      role: await resolveAdminRole(verifiedEmail),
      isMock: false
    }
  };
}
