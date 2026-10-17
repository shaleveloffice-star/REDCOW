import { NextResponse } from "next/server";

import { isVideoMediaUrl } from "@/lib/menu-media";
import { registerUploadInGallery } from "@/lib/admin/register-gallery-upload";
import { getAdminApiSession } from "@/lib/auth/admin-api-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false as const, error }, { status });
}

/** Registers a video already uploaded to Blob (or any public video URL) in the gallery. */
export async function POST(request: Request) {
  try {
    const session = await getAdminApiSession();
    if (!session) {
      return jsonError("אין הרשאת אדמין. התחברו מחדש ל־/admin/login", 401);
    }

    let body: { url?: string; title?: string; fileName?: string };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return jsonError("גוף הבקשה לא תקין");
    }

    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url || !isVideoMediaUrl(url)) {
      return jsonError("כתובת סרטון לא תקינה");
    }

    await registerUploadInGallery({
      url,
      fileName: typeof body.fileName === "string" ? body.fileName : undefined,
      title: body.title
    });

    return NextResponse.json({ ok: true as const, url }, { status: 200 });
  } catch (err) {
    console.error(
      "[POST /api/admin/gallery-video/register]",
      err instanceof Error ? err.message : err
    );
    return jsonError("רישום הסרטון בגלריה נכשל.", 500);
  }
}
