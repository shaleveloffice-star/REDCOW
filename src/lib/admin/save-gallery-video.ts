import "server-only";

import path from "path";

import {
  detectVideoMime,
  extForVideoMime,
  formatBytesShort,
  GALLERY_VIDEO_MAX_BYTES,
  isVideoMime,
  type VideoMime
} from "@/lib/admin/media-mime";
import {
  GALLERY_UPLOAD_DATA_DIR,
  GALLERY_UPLOAD_PUBLIC_DIR,
  galleryImagePublicUrl
} from "@/lib/admin/save-gallery-image";
import {
  isVercelBlobConfigured,
  uploadImageToVercelBlob
} from "@/lib/admin/upload-blob";
import { writeBytes } from "@/lib/admin/write-upload-bytes";

export type ProcessGalleryVideoResult =
  | { ok: true; url: string; fileName: string }
  | { ok: false; error: string };

function isReadOnlyServerless(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

async function saveGalleryVideoBytes(
  fileName: string,
  bytes: Buffer
): Promise<{ url: string }> {
  const dataPath = path.join(GALLERY_UPLOAD_DATA_DIR, fileName);
  const publicPath = path.join(GALLERY_UPLOAD_PUBLIC_DIR, fileName);

  try {
    await writeBytes(dataPath, bytes);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    throw new Error(`שמירת הסרטון נכשלה: ${detail}`);
  }

  try {
    await writeBytes(publicPath, bytes);
  } catch {
    // public/ may be read-only — API route serves from data/local.
  }

  return { url: galleryImagePublicUrl(fileName) };
}

function resolveVideoMime(bytes: Buffer, fileName?: string, mimeHint?: string): VideoMime | null {
  const fromBytes = detectVideoMime(bytes, fileName ?? "");
  if (fromBytes) return fromBytes;
  if (mimeHint && isVideoMime(mimeHint.toLowerCase())) {
    return mimeHint.toLowerCase() as VideoMime;
  }
  return null;
}

export async function processGalleryVideoUpload(
  bytes: Buffer,
  options?: { fileName?: string; mime?: string }
): Promise<ProcessGalleryVideoResult> {
  if (bytes.length === 0) {
    return { ok: false, error: "לא נבחר קובץ סרטון" };
  }
  if (bytes.length > GALLERY_VIDEO_MAX_BYTES) {
    return {
      ok: false,
      error: `הסרטון גדול מדי (מקסימום ${formatBytesShort(GALLERY_VIDEO_MAX_BYTES)})`
    };
  }

  const mime = resolveVideoMime(bytes, options?.fileName, options?.mime);
  if (!mime) {
    return { ok: false, error: "סוג קובץ לא נתמך. השתמשו ב-MP4, WebM או MOV" };
  }

  const ext = extForVideoMime(mime);
  const fileName = `gal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
  const blobPath = `gallery/${fileName}`;

  if (isVercelBlobConfigured() || isReadOnlyServerless()) {
    const uploaded = await uploadImageToVercelBlob(blobPath, bytes, mime);
    if (uploaded.ok) {
      return { ok: true, url: uploaded.url, fileName };
    }
    if (isReadOnlyServerless()) {
      return { ok: false, error: uploaded.error };
    }
    console.warn("[processGalleryVideoUpload] Blob failed, trying local disk:", uploaded.error);
  }

  if (isReadOnlyServerless()) {
    return {
      ok: false,
      error:
        "לא ניתן לשמור סרטונים בשרת זה בלי Vercel Blob. בדקו ש-BLOB_READ_WRITE_TOKEN מוגדר בפרויקט."
    };
  }

  try {
    const saved = await saveGalleryVideoBytes(fileName, bytes);
    return { ok: true, url: saved.url, fileName };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return {
      ok: false,
      error: detail.startsWith("שמירת") ? detail : "שמירת הסרטון לשרת נכשלה. נסו שוב."
    };
  }
}
