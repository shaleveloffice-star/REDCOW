import "server-only";

import { put, type PutBlobResult } from "@vercel/blob";

export type BlobUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Public Blob store connected to this project (Access: Public).
 * Name in dashboard: nbburger-blob (store_YtiRgyBGU1IPJyak).
 * Env binding: BLOB_STORE_ID (+ VERCEL_OIDC_TOKEN on Vercel, or BLOB_READ_WRITE_TOKEN).
 */
export const PUBLIC_MENU_BLOB_STORE_ID = "store_YtiRgyBGU1IPJyak";

function getPublicBlobStoreId(): string | null {
  const fromEnv = process.env.BLOB_STORE_ID?.trim();
  if (fromEnv) return fromEnv;
  // Fallback to the known public store if env is briefly missing after reconnect.
  if (process.env.VERCEL === "1") return PUBLIC_MENU_BLOB_STORE_ID;
  return null;
}

function getReadWriteToken(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token || token === "[SENSITIVE]" || token === "Encrypted") {
    return null;
  }
  return token;
}

/** True when we can authenticate to the public Blob store. */
export function isVercelBlobConfigured(): boolean {
  const storeId = getPublicBlobStoreId();
  const token = getReadWriteToken();
  const oidc = process.env.VERCEL_OIDC_TOKEN?.trim();
  return Boolean(token || (storeId && oidc) || (process.env.VERCEL === "1" && storeId));
}

type PutAuth =
  | { mode: "oidc"; storeId: string; oidcToken: string }
  | { mode: "token"; token: string };

/**
 * Prefer OIDC + BLOB_STORE_ID on Vercel so uploads always hit the PUBLIC store,
 * never a leftover private-store RW token.
 */
function resolvePutAuth(): PutAuth | { mode: "missing"; error: string } {
  const storeId = getPublicBlobStoreId();
  const oidcToken = process.env.VERCEL_OIDC_TOKEN?.trim();
  const rwToken = getReadWriteToken();
  const onVercel = process.env.VERCEL === "1";

  // Production / Preview on Vercel: bind to the PUBLIC store by ID via OIDC first.
  // OIDC + BLOB_STORE_ID targets nbburger-blob (Access: Public) and avoids any
  // leftover private-store token that might still be named BLOB_READ_WRITE_TOKEN.
  if (onVercel) {
    if (storeId && oidcToken) {
      return { mode: "oidc", storeId, oidcToken };
    }
    // Same public store's RW token (injected when the public store is connected).
    if (rwToken) {
      return { mode: "token", token: rwToken };
    }
    return {
      mode: "missing",
      error:
        "Vercel Blob (public) לא מוגדר בשרת. ודאו ש-store הציבורי מחובר לפרויקט (BLOB_STORE_ID=store_YtiRgyBGU1IPJyak) ו-OIDC / BLOB_READ_WRITE_TOKEN פעילים."
    };
  }

  // Local: RW token from the PUBLIC store only.
  if (rwToken) {
    return { mode: "token", token: rwToken };
  }

  return {
    mode: "missing",
    error:
      "Vercel Blob (public) לא מוגדר מקומית. הוסיפו ל-.env.local את BLOB_READ_WRITE_TOKEN של ה-store הציבורי (nbburger-blob)."
  };
}

/**
 * Upload image bytes to the project's PUBLIC Vercel Blob store.
 * Returns a public HTTPS URL to store in Firestore (URL only — not file bytes).
 */
export async function uploadImageToVercelBlob(
  pathname: string,
  bytes: Buffer,
  contentType: string
): Promise<BlobUploadResult> {
  const auth = resolvePutAuth();
  if (auth.mode === "missing") {
    return { ok: false, error: auth.error };
  }

  try {
    let blob: PutBlobResult;

    if (auth.mode === "oidc") {
      blob = await put(pathname, bytes, {
        access: "public",
        contentType,
        addRandomSuffix: false,
        storeId: auth.storeId,
        oidcToken: auth.oidcToken
      });
    } else {
      blob = await put(pathname, bytes, {
        access: "public",
        contentType,
        addRandomSuffix: false,
        token: auth.token
      });
    }

    if (!blob.url) {
      return { ok: false, error: "העלאה ל-Vercel Blob לא החזירה כתובת URL" };
    }

    // Guard: public store URLs use *.public.blob.vercel-storage.com
    if (!blob.url.includes(".public.blob.vercel-storage.com")) {
      console.warn(
        "[uploadImageToVercelBlob] unexpected host (expected public store):",
        new URL(blob.url).host
      );
    }

    return { ok: true, url: blob.url };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.error(
      "[uploadImageToVercelBlob]",
      detail,
      "storeId=",
      getPublicBlobStoreId(),
      "auth=",
      auth.mode
    );

    if (/private store/i.test(detail)) {
      return {
        ok: false,
        error:
          "העלאה נכשלה: נעשה שימוש ב-store פרטי. ודאו ש-BLOB_STORE_ID מצביע ל-store הציבורי (nbburger-blob / store_YtiRgyBGU1IPJyak) וש-BLOB_READ_WRITE_TOKEN שייך לאותו store."
      };
    }

    return {
      ok: false,
      error: `העלאה ל-Vercel Blob נכשלה: ${detail}`
    };
  }
}
