import { NextResponse } from "next/server";

import { registerUploadInGallery } from "@/lib/admin/register-gallery-upload";
import { getAdminApiSession } from "@/lib/auth/admin-api-session";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false as const, error }, { status });
}

/** Registers an already-hosted image/video URL (paste or upload-from-elsewhere) in the gallery. */
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

    let url = "";
    try {
      url = assertSafeHttpUrl(String(body.url ?? ""), "מדיה");
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : "כתובת מדיה לא תקינה");
    }

    if (!url || url.startsWith("data:")) {
      return jsonError("כתובת מדיה לא תקינה");
    }

    await registerUploadInGallery({
      strict: true,
      url,
      fileName: typeof body.fileName === "string" ? body.fileName : undefined,
      title: body.title
    });

    return NextResponse.json({ ok: true as const, url }, { status: 200 });
  } catch (err) {
    console.error(
      "[POST /api/admin/gallery-media/register]",
      err instanceof Error ? err.message : err
    );
    return jsonError("רישום המדיה בגלריה נכשל.", 500);
  }
}
