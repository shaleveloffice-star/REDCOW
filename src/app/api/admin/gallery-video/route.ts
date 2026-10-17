import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import {
  detectVideoMimeFromFileName,
  formatBytesShort,
  GALLERY_VIDEO_MAX_BYTES,
  isVideoMime,
  VIDEO_MIME_TYPES
} from "@/lib/admin/media-mime";
import { registerUploadInGallery } from "@/lib/admin/register-gallery-upload";
import { processGalleryVideoUpload } from "@/lib/admin/save-gallery-video";
import { isVercelBlobConfigured } from "@/lib/admin/upload-blob";
import { getAdminApiSession } from "@/lib/auth/admin-api-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false as const, error }, { status });
}

/**
 * Two modes:
 * 1) JSON body for `@vercel/blob/client` direct upload (large videos on Vercel).
 * 2) multipart/form-data for local / smaller uploads through the server.
 */
export async function POST(request: Request) {
  try {
    const session = await getAdminApiSession();
    if (!session) {
      return jsonError("אין הרשאת אדמין להעלאת סרטון. התחברו מחדש ל־/admin/login", 401);
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      if (!isVercelBlobConfigured()) {
        return jsonError(
          "העלאת סרטון ישירה ל-Blob לא זמינה. העלו דרך בחירת קובץ (מצב מקומי) או הגדירו BLOB."
        );
      }

      let body: HandleUploadBody;
      try {
        body = (await request.json()) as HandleUploadBody;
      } catch {
        return jsonError("גוף הבקשה לא תקין");
      }

      try {
        const jsonResponse = await handleUpload({
          body,
          request,
          onBeforeGenerateToken: async (pathname) => {
            const lower = pathname.toLowerCase();
            if (!lower.startsWith("gallery/")) {
              throw new Error("נתיב העלאה לא תקין");
            }
            if (!detectVideoMimeFromFileName(pathname)) {
              throw new Error("סוג קובץ לא נתמך. השתמשו ב-MP4, WebM או MOV");
            }
            return {
              allowedContentTypes: [...VIDEO_MIME_TYPES],
              maximumSizeInBytes: GALLERY_VIDEO_MAX_BYTES,
              addRandomSuffix: true,
              tokenPayload: JSON.stringify({ title: pathname.split("/").pop() ?? "video" })
            };
          },
          onUploadCompleted: async ({ blob, tokenPayload }) => {
            let title: unknown = blob.pathname.split("/").pop();
            try {
              const parsed = tokenPayload ? (JSON.parse(tokenPayload) as { title?: string }) : null;
              if (parsed?.title) title = parsed.title;
            } catch {
              // keep pathname title
            }
            await registerUploadInGallery({
              url: blob.url,
              fileName: blob.pathname.split("/").pop(),
              title
            });
          }
        });
        return NextResponse.json(jsonResponse);
      } catch (err) {
        const message = err instanceof Error ? err.message : "העלאת הסרטון נכשלה";
        return jsonError(message, 400);
      }
    }

    if (contentType.includes("multipart/form-data")) {
      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        return jsonError("גוף הבקשה לא תקין");
      }

      const file = form.get("file");
      if (!(file instanceof File)) {
        return jsonError("לא נבחר קובץ סרטון");
      }

      const mime = (file.type || "").toLowerCase();
      if (mime && !isVideoMime(mime) && !detectVideoMimeFromFileName(file.name)) {
        return jsonError("סוג קובץ לא נתמך. השתמשו ב-MP4, WebM או MOV");
      }
      if (file.size > GALLERY_VIDEO_MAX_BYTES) {
        return jsonError(`הסרטון גדול מדי (מקסימום ${formatBytesShort(GALLERY_VIDEO_MAX_BYTES)})`);
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const result = await processGalleryVideoUpload(bytes, {
        fileName: file.name,
        mime: file.type
      });
      if (!result.ok) {
        return NextResponse.json(result, { status: 400 });
      }

      await registerUploadInGallery({
        url: result.url,
        fileName: result.fileName,
        title: typeof form.get("title") === "string" ? form.get("title") : file.name
      });
      return NextResponse.json(result, { status: 200 });
    }

    return jsonError("בקשת העלאה לא תקינה");
  } catch (err) {
    console.error("[POST /api/admin/gallery-video]", err instanceof Error ? err.message : err);
    return jsonError("העלאת הסרטון נכשלה. נסו שוב או רעננו את הדף.", 500);
  }
}
