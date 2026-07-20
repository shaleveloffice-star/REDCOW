"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { saveMenuImageBytes } from "@/lib/admin/save-menu-image";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type UploadImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

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

function detectImageMime(bytes: Buffer): string | null {
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

/** Next/Node may not treat FormData entries as `instanceof File`. */
function asUploadBlob(value: FormDataEntryValue | null): Blob | null {
  if (!value || typeof value === "string") return null;
  if (typeof (value as Blob).arrayBuffer !== "function") return null;
  if (typeof (value as Blob).size !== "number" || (value as Blob).size <= 0) return null;
  return value as Blob;
}

async function uploadImageFile(file: Blob): Promise<UploadImageResult> {
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "הקובץ גדול מדי (מקסימום 8MB)" };
  }

  let bytes: Buffer;
  try {
    bytes = Buffer.from(await file.arrayBuffer());
  } catch {
    return { ok: false, error: "לא ניתן לקרוא את קובץ התמונה" };
  }

  const detectedMime = detectImageMime(bytes);
  if (!detectedMime || !ALLOWED_TYPES.has(detectedMime)) {
    return { ok: false, error: "סוג קובץ לא נתמך. השתמשו ב-JPG, PNG, WebP או GIF" };
  }

  const ext = extForMime(detectedMime);
  const fileName = `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;

  try {
    const saved = await saveMenuImageBytes(fileName, bytes);
    return { ok: true, url: saved.url };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.warn("[uploadMenuImageAction] write failed:", detail);
    return {
      ok: false,
      error:
        detail.startsWith("שמירת")
          ? detail
          : "שמירת התמונה נכשלה. נסו שוב — הקובץ נשמר ב־data/local/uploads/menu"
    };
  }
}

export async function uploadMenuImageAction(formData: FormData): Promise<UploadImageResult> {
  try {
    await requireAdmin();
  } catch (err) {
    const detail = err instanceof Error ? err.message : "";
    console.warn("[uploadMenuImageAction] auth failed:", detail);
    return {
      ok: false,
      error: "אין הרשאת אדמין להעלאת תמונה. התחברו מחדש ל־/admin/login"
    };
  }

  const file = asUploadBlob(formData.get("file"));
  if (!file) {
    return { ok: false, error: "לא נבחר קובץ תמונה" };
  }

  return uploadImageFile(file);
}
