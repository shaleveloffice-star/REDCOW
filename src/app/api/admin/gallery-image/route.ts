import { NextResponse } from "next/server";

import { parseDataImageUrl } from "@/lib/admin/save-menu-image";
import { processGalleryImageUpload } from "@/lib/admin/save-gallery-image";
import { getAdminApiSession } from "@/lib/auth/admin-api-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false as const, error }, { status });
}

type JsonUploadBody = {
  dataUrl?: string;
};

export async function POST(request: Request) {
  try {
    const session = await getAdminApiSession();
    if (!session) {
      return jsonError("אין הרשאת אדמין להעלאת תמונה. התחברו מחדש ל־/admin/login", 401);
    }

    const contentType = request.headers.get("content-type") ?? "";
    let bytes: Buffer | null = null;

    if (contentType.includes("application/json")) {
      let body: JsonUploadBody;
      try {
        body = (await request.json()) as JsonUploadBody;
      } catch {
        return jsonError("גוף הבקשה לא תקין");
      }

      if (typeof body.dataUrl === "string" && body.dataUrl.startsWith("data:image/")) {
        const parsed = parseDataImageUrl(body.dataUrl);
        if (!parsed) return jsonError("תמונת data URL לא תקינה");
        bytes = parsed.bytes;
      } else {
        return jsonError("לא נשלחה תמונה");
      }
    } else {
      return jsonError("בקשת העלאה לא תקינה");
    }

    if (!bytes) return jsonError("לא נבחר קובץ תמונה");

    const result = await processGalleryImageUpload(bytes);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[POST /api/admin/gallery-image]", err instanceof Error ? err.message : err);
    return jsonError("העלאת התמונה נכשלה. נסו שוב או רעננו את הדף.", 500);
  }
}
