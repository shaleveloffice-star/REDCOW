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
  let rejectDeadline: (error: Error) => void = () => {};
  const deadline = new Promise<never>((_, reject) => { rejectDeadline = reject; });
  const expire = (message: string) => {
    rejectDeadline(new Error(message));
    controller.abort();
  };
  const timeout = setTimeout(() => expire("ההעלאה חרגה מ־10 דקות. נסו שוב כשהדפדפן פתוח והחיבור יציב."), 10 * 60 * 1000);
  let idleTimeout: ReturnType<typeof setTimeout>;
  const resetIdleTimeout = (message: string, duration = 90_000) => {
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => expire(message), duration);
  };
  const stalledMessage = "ההעלאה נעצרה ללא התקדמות במשך 90 שניות. נסו לבחור את הסרטון מחדש מהאחסון במכשיר ולבדוק את חיבור האינטרנט.";
  resetIdleTimeout(stalledMessage);
  let lastLoaded = 0;
  try {
    onProgress?.(0);
    const pathname = `gallery/${file.name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`;
    // Do not retry through a server function: large files exceed its body limit.
    const blob = await Promise.race([uploadPresigned(pathname, file, {
      access: "public",
      contentType,
      handleUploadUrl: "/api/admin/gallery-video",
      // All accepted videos are <=80 MB. Avoid the mobile File.stream/multipart
      // pipeline; XHR sends the original File directly and reports byte progress.
      multipart: false,
      abortSignal: controller.signal,
      onUploadProgress: ({ loaded, percentage }) => {
        if (controller.signal.aborted) return;
        if (loaded > lastLoaded) {
          lastLoaded = loaded;
          resetIdleTimeout(stalledMessage);
        }
        onProgress?.(Math.floor(percentage));
      }
    }), deadline]);
    onProgress?.(100);
    resetIdleTimeout("הסרטון נשלח לאחסון אך רישומו בגלריה מתעכב. רעננו ובדקו את הגלריה לפני ניסיון נוסף.", 60_000);
    const response = await Promise.race([fetch("/api/admin/gallery-video/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      signal: controller.signal,
      body: JSON.stringify({ url: blob.url, title: file.name, fileName: blob.pathname.split("/").pop() })
    }), deadline]);
    const result = await Promise.race([response.json(), deadline]);
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "הסרטון הועלה אך רישומו בגלריה נכשל. רעננו ובדקו את הגלריה.");
    }
    return { url: blob.url, fileName: blob.pathname.split("/").pop() };
  } catch (error) {
    throw new Error(`העלאת הסרטון נכשלה: ${error instanceof Error ? error.message : "בדקו את החיבור ונסו שוב"}`);
  } finally {
    clearTimeout(timeout);
    clearTimeout(idleTimeout!);
  }
}
