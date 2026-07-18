"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MENU_IMAGE_DIR = path.join(process.cwd(), "public", "images", "menu");
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

async function uploadImageFile(file: File, targetDir: string, publicPrefix: string): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("לא נבחר קובץ תמונה");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("הקובץ גדול מדי (מקסימום 8MB)");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const detectedMime = detectImageMime(bytes);
  if (!detectedMime || !ALLOWED_TYPES.has(detectedMime)) {
    throw new Error("סוג קובץ לא נתמך. השתמשו ב-JPG, PNG, WebP או GIF");
  }

  const ext = extForMime(detectedMime);
  const fileName = `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
  const diskPath = path.join(targetDir, fileName);

  await mkdir(targetDir, { recursive: true });
  await writeFile(diskPath, bytes);

  return `${publicPrefix}/${fileName}`;
}

export async function uploadMenuImageAction(formData: FormData): Promise<string> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("לא נבחר קובץ תמונה");
  }
  return uploadImageFile(file, MENU_IMAGE_DIR, "/images/menu");
}
