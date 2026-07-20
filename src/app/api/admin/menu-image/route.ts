import { NextResponse } from "next/server";

import { getCurrentAdminSession } from "@/lib/auth/get-current-admin-session";
import { processMenuImageUpload } from "@/lib/admin/save-menu-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Allow enough time for large images on slow disks (OneDrive). */
export const maxDuration = 60;

function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false as const, error }, { status });
}

async function requireUploadAdmin() {
  try {
    return await getCurrentAdminSession();
  } catch (err) {
    const detail = err instanceof Error ? err.message : "auth error";
    console.warn("[POST /api/admin/menu-image] auth config:", detail);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUploadAdmin();
    if (!session) {
      return jsonError("אין הרשאת אדמין להעלאת תמונה. התחברו מחדש ל־/admin/login", 401);
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return jsonError("בקשת העלאה לא תקינה (חסר multipart)");
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      console.warn("[POST /api/admin/menu-image] formData failed:", detail);
      return jsonError("לא ניתן לקרוא את קובץ התמונה (ייתכן שהקובץ גדול מדי)");
    }

    const entry = formData.get("file");
    if (!entry || typeof entry === "string") {
      return jsonError("לא נבחר קובץ תמונה");
    }

    const blob = entry as Blob;
    if (typeof blob.arrayBuffer !== "function" || blob.size <= 0) {
      return jsonError("לא נבחר קובץ תמונה");
    }

    let bytes: Buffer;
    try {
      bytes = Buffer.from(await blob.arrayBuffer());
    } catch {
      return jsonError("לא ניתן לקרוא את קובץ התמונה");
    }

    const result = await processMenuImageUpload(bytes);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.error("[POST /api/admin/menu-image]", detail);
    return jsonError("העלאת התמונה נכשלה. נסו שוב או רעננו את הדף.", 500);
  }
}
