import { upload } from "@vercel/blob/client";

import {
  detectVideoMimeFromFileName,
  formatBytesShort,
  GALLERY_VIDEO_MAX_BYTES,
  isVideoMime
} from "@/lib/admin/media-mime";

export async function uploadAdminGalleryVideo(
  file: File
): Promise<{ url: string; fileName?: string }> {
  if (!detectVideoMimeFromFileName(file.name) && !isVideoMime(file.type.toLowerCase())) {
    throw new Error("סוג קובץ לא נתמך. השתמשו ב-MP4, WebM או MOV");
  }
  if (file.size > GALLERY_VIDEO_MAX_BYTES) {
    throw new Error(`הסרטון גדול מדי (מקסימום ${formatBytesShort(GALLERY_VIDEO_MAX_BYTES)})`);
  }

  // Prefer direct-to-Blob upload (avoids Vercel request body limits).
  try {
    const pathname = `gallery/${file.name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`;
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/admin/gallery-video",
      multipart: file.size > 8 * 1024 * 1024
    });

    await fetch("/api/admin/gallery-video/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        url: blob.url,
        title: file.name,
        fileName: blob.pathname.split("/").pop()
      })
    });

    return { url: blob.url, fileName: blob.pathname.split("/").pop() };
  } catch {
    // Local / Blob unavailable: fall back to multipart through the API.
  }

  const form = new FormData();
  form.set("file", file);
  form.set("title", file.name);

  const response = await fetch("/api/admin/gallery-video", {
    method: "POST",
    credentials: "same-origin",
    body: form
  });

  const result = (await response.json()) as
    | { ok: true; url: string; fileName?: string }
    | { ok: false; error: string };

  if (!response.ok || !result.ok) {
    throw new Error("error" in result ? result.error : "העלאת הסרטון נכשלה");
  }

  return { url: result.url, fileName: result.fileName };
}
