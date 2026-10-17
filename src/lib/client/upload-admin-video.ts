import { uploadPresigned } from "@vercel/blob/client";
import { detectVideoMimeFromFileName, formatBytesShort, GALLERY_VIDEO_MAX_BYTES, isVideoMime } from "@/lib/admin/media-mime";

export async function uploadAdminGalleryVideo(
  file: File,
  onProgress?: (percentage: number) => void
): Promise<{ url: string; fileName?: string }> {
  const contentType = detectVideoMimeFromFileName(file.name) ?? file.type.toLowerCase();
  if (!isVideoMime(contentType)) {
    throw new Error("סוג קובץ לא נתמך. השתמשו ב-MP4, WebM או MOV");
  }
  if (!file.size || file.size > GALLERY_VIDEO_MAX_BYTES) {
    throw new Error(`בחרו סרטון שאינו ריק, עד ${formatBytesShort(GALLERY_VIDEO_MAX_BYTES)}`);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);
  try {
    onProgress?.(0);
    const pathname = `gallery/${file.name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`;
    // Do not retry through a server function: large files exceed its body limit.
    const blob = await uploadPresigned(pathname, file, {
      access: "public",
      contentType,
      handleUploadUrl: "/api/admin/gallery-video",
      multipart: file.size > 8 * 1024 * 1024,
      abortSignal: controller.signal,
      onUploadProgress: ({ percentage }) => onProgress?.(Math.floor(percentage))
    });
    onProgress?.(100);
    const response = await fetch("/api/admin/gallery-video/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      signal: controller.signal,
      body: JSON.stringify({ url: blob.url, title: file.name, fileName: blob.pathname.split("/").pop() })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "הסרטון הועלה אך רישומו בגלריה נכשל. רעננו ובדקו את הגלריה.");
    }
    return { url: blob.url, fileName: blob.pathname.split("/").pop() };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("ההעלאה חרגה מ־10 דקות. בדקו את חיבור האינטרנט ונסו שוב.");
    }
    throw new Error(`העלאת הסרטון נכשלה: ${error instanceof Error ? error.message : "בדקו את החיבור ונסו שוב"}`);
  } finally {
    clearTimeout(timeout);
  }
}
