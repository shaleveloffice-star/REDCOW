import "server-only";

import { access, mkdir, writeFile } from "fs/promises";
import { constants as fsConstants } from "fs";
import path from "path";

import { uploadMenuImageToFirebaseStorage } from "@/lib/firebase/admin-storage";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin-runtime";

/** Durable local store for admin-uploaded menu images. */
export const MENU_UPLOAD_DATA_DIR = path.join(
  process.cwd(),
  "data",
  "local",
  "uploads",
  "menu"
);

/** Optional static mirror when public/ is writable. */
export const MENU_UPLOAD_PUBLIC_DIR = path.join(
  process.cwd(),
  "public",
  "images",
  "menu"
);

export const MENU_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

/** Vercel/Lambda have a read-only filesystem. */
function isReadOnlyServerless(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/** Canonical public URL — served by /api/media/menu/[file] (no rewrite dependency). */
export function menuImagePublicUrl(fileName: string): string {
  return `/api/media/menu/${fileName}`;
}

export function menuImageDiskPath(fileName: string): string {
  return path.join(MENU_UPLOAD_DATA_DIR, fileName);
}

function extForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".jpg";
  }
}

export function detectImageMime(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x39 || bytes[4] === 0x37) &&
    bytes[5] === 0x61
  ) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function parseDataImageUrl(dataUrl: string): { mime: string; bytes: Buffer } | null {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/i.exec(
    dataUrl.trim()
  );
  if (!match) return null;
  const mime = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  try {
    const bytes = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
    if (bytes.length === 0) return null;
    return { mime, bytes };
  } catch {
    return null;
  }
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

export async function saveMenuImageBytes(
  fileName: string,
  bytes: Buffer
): Promise<{ url: string; mirroredToPublic: boolean }> {
  const dataPath = path.join(MENU_UPLOAD_DATA_DIR, fileName);
  const publicPath = path.join(MENU_UPLOAD_PUBLIC_DIR, fileName);

  try {
    await writeBytes(dataPath, bytes);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: string }).code ?? "")
        : "";
    throw new Error(
      `שמירת התמונה נכשלה (${code || "IO"}): ${detail}. נתיב: data/local/uploads/menu`
    );
  }

  let mirroredToPublic = false;
  try {
    await writeBytes(publicPath, bytes);
    mirroredToPublic = true;
  } catch {
    // public/ may be ReadOnly on OneDrive — API route still serves from data/local.
  }

  return { url: menuImagePublicUrl(fileName), mirroredToPublic };
}

export type ProcessMenuImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function processMenuImageUpload(bytes: Buffer): Promise<ProcessMenuImageResult> {
  if (bytes.length === 0) {
    return { ok: false, error: "לא נבחר קובץ תמונה" };
  }
  if (bytes.length > MENU_IMAGE_MAX_BYTES) {
    return { ok: false, error: "הקובץ גדול מדי אחרי דחיסה (מקסימום 2MB)" };
  }

  const detectedMime = detectImageMime(bytes);
  if (!detectedMime) {
    return { ok: false, error: "סוג קובץ לא נתמך. השתמשו ב-JPG, PNG, WebP או GIF" };
  }

  const ext = extForMime(detectedMime);
  const fileName = `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;

  // Production / when Firebase Admin is available: store in Firebase Storage (short HTTPS URL).
  // Never put large data URLs into Firestore — that breaks menu saves (1MB doc limit).
  if (isReadOnlyServerless() || (await isFirebaseAdminConfigured())) {
    const uploaded = await uploadMenuImageToFirebaseStorage(fileName, bytes, detectedMime);
    if (uploaded.ok) {
      return uploaded;
    }
    // On Vercel there is no disk fallback — surface the Storage error clearly.
    if (isReadOnlyServerless()) {
      return uploaded;
    }
    console.warn("[processMenuImageUpload] Storage failed, trying local disk:", uploaded.error);
  }

  if (isReadOnlyServerless()) {
    return {
      ok: false,
      error:
        "לא ניתן לשמור תמונות בשרת זה בלי Firebase Storage. בדקו את הגדרות Firebase ב-Vercel."
    };
  }

  try {
    const saved = await saveMenuImageBytes(fileName, bytes);
    return { ok: true, url: saved.url };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.warn("[processMenuImageUpload] disk write failed:", detail);
    return {
      ok: false,
      error: detail.startsWith("שמירת") ? detail : "שמירת התמונה לשרת נכשלה. נסו שוב."
    };
  }
}

/** If admin saved a data URL, persist it and return a short URL (Storage or local file). */
export async function materializeMenuImageUrl(imageUrl: string): Promise<ProcessMenuImageResult> {
  const trimmed = imageUrl.trim();
  if (!trimmed.startsWith("data:image/")) {
    return { ok: true, url: trimmed };
  }

  const parsed = parseDataImageUrl(trimmed);
  if (!parsed) {
    return { ok: false, error: "תמונת data URL לא תקינה" };
  }

  return processMenuImageUpload(parsed.bytes);
}
