import "server-only";

import { access, mkdir, writeFile } from "fs/promises";
import { constants as fsConstants } from "fs";
import path from "path";

/** Durable local store — same area as JSON admin data (survives OneDrive ReadOnly on public/). */
export const MENU_UPLOAD_DATA_DIR = path.join(
  process.cwd(),
  "data",
  "local",
  "uploads",
  "menu"
);

/** Optional static mirror for faster serving when the folder is writable. */
export const MENU_UPLOAD_PUBLIC_DIR = path.join(
  process.cwd(),
  "public",
  "images",
  "menu"
);

export const MENU_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

export function menuImagePublicUrl(fileName: string): string {
  return `/images/menu/${fileName}`;
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

async function writeBytes(filePath: string, bytes: Buffer): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes);
  await access(filePath, fsConstants.R_OK);
}

/**
 * Persist menu image bytes. Always writes to data/local/uploads/menu.
 * Mirrors to public/images/menu when possible.
 */
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
    // OneDrive / Vercel read-only public — API fallback rewrite still serves the file.
  }

  return { url: menuImagePublicUrl(fileName), mirroredToPublic };
}

export type ProcessMenuImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Validate + save raw image bytes. Never throws — always returns a result. */
export async function processMenuImageUpload(bytes: Buffer): Promise<ProcessMenuImageResult> {
  if (bytes.length === 0) {
    return { ok: false, error: "לא נבחר קובץ תמונה" };
  }
  if (bytes.length > MENU_IMAGE_MAX_BYTES) {
    return { ok: false, error: "הקובץ גדול מדי (מקסימום 8MB)" };
  }

  const detectedMime = detectImageMime(bytes);
  if (!detectedMime) {
    return { ok: false, error: "סוג קובץ לא נתמך. השתמשו ב-JPG, PNG, WebP או GIF" };
  }

  const ext = extForMime(detectedMime);
  const fileName = `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;

  try {
    const saved = await saveMenuImageBytes(fileName, bytes);
    return { ok: true, url: saved.url };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.warn("[processMenuImageUpload] write failed:", detail);
    return {
      ok: false,
      error: detail.startsWith("שמירת") ? detail : "שמירת התמונה לשרת נכשלה. נסו שוב."
    };
  }
}
