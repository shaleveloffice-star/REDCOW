import "server-only";

import { put } from "@vercel/blob";

export type BlobUploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** True when Vercel Blob credentials are available (token or OIDC on Vercel). */
export function isVercelBlobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      (process.env.VERCEL === "1" && process.env.BLOB_STORE_ID?.trim())
  );
}

/**
 * Upload image bytes to the project's Vercel Blob store.
 * Returns a public HTTPS URL to store in Firestore (short string, not the file bytes).
 */
export async function uploadImageToVercelBlob(
  pathname: string,
  bytes: Buffer,
  contentType: string
): Promise<BlobUploadResult> {
  if (!isVercelBlobConfigured()) {
    return {
      ok: false,
      error:
        "Vercel Blob לא מוגדר. חסר BLOB_READ_WRITE_TOKEN (או חיבור Blob ל-Vercel)."
    };
  }

  try {
    const blob = await put(pathname, bytes, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      // Prefer explicit token when present (local + production).
      ...(process.env.BLOB_READ_WRITE_TOKEN?.trim()
        ? { token: process.env.BLOB_READ_WRITE_TOKEN.trim() }
        : {})
    });

    if (!blob.url) {
      return { ok: false, error: "העלאה ל-Vercel Blob לא החזירה כתובת URL" };
    }

    return { ok: true, url: blob.url };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.error("[uploadImageToVercelBlob]", detail);
    return {
      ok: false,
      error: `העלאה ל-Vercel Blob נכשלה: ${detail}`
    };
  }
}
