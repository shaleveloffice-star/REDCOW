"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MENU_IMAGE_DIR = path.join(process.cwd(), "public", "images", "menu");
const SITE_IMAGE_DIR = path.join(process.cwd(), "public", "images", "site");
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

async function uploadImageFile(file: File, targetDir: string, publicPrefix: string): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("לא נבחר קובץ תמונה");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("סוג קובץ לא נתמך. השתמשו ב-JPG, PNG, WebP או GIF");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("הקובץ גדול מדי (מקסימום 8MB)");
  }

  const ext = extForMime(file.type);
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[^\w\-]+/g, "-").slice(0, 40) || "image";
  const fileName = `${base}-${Date.now()}${ext}`;
  const diskPath = path.join(targetDir, fileName);

  await mkdir(targetDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
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

export async function uploadSiteImageAction(formData: FormData): Promise<string> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("לא נבחר קובץ תמונה");
  }
  return uploadImageFile(file, SITE_IMAGE_DIR, "/images/site");
}
