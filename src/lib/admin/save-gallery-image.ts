import "server-only";

import { access, mkdir, writeFile } from "fs/promises";
import { constants as fsConstants } from "fs";
import path from "path";

import {
  detectImageMime,
  extForMime,
  type ProcessMenuImageResult
} from "@/lib/admin/save-menu-image";
import {
  isVercelBlobConfigured,
  uploadImageToVercelBlob
} from "@/lib/admin/upload-blob";

export const GALLERY_UPLOAD_DATA_DIR = path.join(
  process.cwd(),
  "data",
  "local",
  "uploads",
  "gallery"
);

export const GALLERY_UPLOAD_PUBLIC_DIR = path.join(
  process.cwd(),
  "public",
  "images",
  "gallery"
);

export const GALLERY_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

function isReadOnlyServerless(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export function galleryImagePublicUrl(fileName: string): string {
  return `/api/media/gallery/${fileName}`;
}

async function writeBytes(filePath: string, bytes: Buffer): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes);
  await access(filePath, fsConstants.R_OK);
  const { stat } = await import("fs/promises");
  const info = await stat(filePath);
  if (info.size !== bytes.length) {
    throw new Error("גודל הקובץ אחרי כתיבה לא תואם");
  }
}

async function saveGalleryImageBytes(
  fileName: string,
  bytes: Buffer
): Promise<{ url: string }> {
  const dataPath = path.join(GALLERY_UPLOAD_DATA_DIR, fileName);
  const publicPath = path.join(GALLERY_UPLOAD_PUBLIC_DIR, fileName);

  try {
    await writeBytes(dataPath, bytes);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    throw new Error(`שמירת התמונה נכשלה: ${detail}`);
  }

  try {
    await writeBytes(publicPath, bytes);
  } catch {
    // public/ may be read-only — API route serves from data/local.
  }

  return { url: galleryImagePublicUrl(fileName) };
}

export async function processGalleryImageUpload(
  bytes: Buffer
): Promise<ProcessMenuImageResult & { fileName?: string }> {
  if (bytes.length === 0) {
    return { ok: false, error: "לא נבחר קובץ תמונה" };
  }
  if (bytes.length > GALLERY_IMAGE_MAX_BYTES) {
    return { ok: false, error: "הקובץ גדול מדי אחרי דחיסה (מקסימום 2MB)" };
  }

  const detectedMime = detectImageMime(bytes);
  if (!detectedMime) {
    return { ok: false, error: "סוג קובץ לא נתמך. השתמשו ב-JPG, PNG, WebP או GIF" };
  }

  const ext = extForMime(detectedMime);
  const fileName = `gal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
  const blobPath = `gallery/${fileName}`;

  if (isVercelBlobConfigured() || isReadOnlyServerless()) {
    const uploaded = await uploadImageToVercelBlob(blobPath, bytes, detectedMime);
    if (uploaded.ok) {
      return { ...uploaded, fileName };
    }
    if (isReadOnlyServerless()) {
      return uploaded;
    }
    console.warn("[processGalleryImageUpload] Blob failed, trying local disk:", uploaded.error);
  }

  if (isReadOnlyServerless()) {
    return {
      ok: false,
      error:
        "לא ניתן לשמור תמונות בשרת זה בלי Vercel Blob. בדקו ש-BLOB_READ_WRITE_TOKEN מוגדר בפרויקט."
    };
  }

  try {
    const saved = await saveGalleryImageBytes(fileName, bytes);
    return { ok: true, url: saved.url, fileName };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return {
      ok: false,
      error: detail.startsWith("שמירת") ? detail : "שמירת התמונה לשרת נכשלה. נסו שוב."
    };
  }
}
