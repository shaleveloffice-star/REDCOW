import "server-only";

import { execFile } from "child_process";
import { access, mkdir, writeFile } from "fs/promises";
import { constants as fsConstants } from "fs";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

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

export function menuImagePublicUrl(fileName: string): string {
  return `/images/menu/${fileName}`;
}

export function menuImageDiskPath(fileName: string): string {
  return path.join(MENU_UPLOAD_DATA_DIR, fileName);
}

async function clearWindowsReadOnly(dir: string): Promise<void> {
  if (process.platform !== "win32") return;
  try {
    await execFileAsync("attrib", ["-R", dir, "/S", "/D"], {
      windowsHide: true,
      timeout: 5000
    });
  } catch {
    // Best-effort — OneDrive may re-apply attributes.
  }
}

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
  await clearWindowsReadOnly(dir);
}

async function writeBytes(filePath: string, bytes: Buffer): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  // Write via temp + rename is flaky on OneDrive; direct write is fine once dir is writable.
  await writeFile(filePath, bytes);
  await access(filePath, fsConstants.R_OK);
}

/**
 * Persist menu image bytes. Always writes to data/local/uploads/menu.
 * Also mirrors to public/images/menu when possible (static CDN-style serve).
 * Public URL stays `/images/menu/...` — next.config fallback rewrite hits the API if the static file is missing.
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
