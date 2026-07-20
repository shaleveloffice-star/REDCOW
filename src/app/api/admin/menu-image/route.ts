import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  assertProductionAuthMode,
  getAllowedAdminEmails,
  isEmailAllowedForAdmin,
  isOpenAdminAuthMode
} from "@/lib/auth/auth-config";
import {
  getAdminSessionCookieName,
  verifyAdminSessionToken
} from "@/lib/auth/admin-session";
import {
  parseDataImageUrl,
  processMenuImageUpload
} from "@/lib/admin/save-menu-image";
import type { AdminSession } from "@/types/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false as const, error }, { status });
}

/**
 * Auth for upload API — must NOT use React cache() (hangs/breaks in Route Handlers).
 */
async function getUploadAdminSession(): Promise<AdminSession | null> {
  try {
    assertProductionAuthMode();

    if (isOpenAdminAuthMode()) {
      return { email: "admin@nbburger.co.il", role: "owner", isMock: true };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminSessionCookieName())?.value;
    if (!token) return null;

    const session = await verifyAdminSessionToken(token);
    if (!session) return null;

    const allowed = getAllowedAdminEmails();
    if (!isEmailAllowedForAdmin(session.email, allowed)) return null;

    return session;
  } catch (err) {
    console.warn(
      "[POST /api/admin/menu-image] auth:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

type JsonUploadBody = {
  dataUrl?: string;
  base64?: string;
  mime?: string;
};

export async function POST(request: Request) {
  try {
    const session = await getUploadAdminSession();
    if (!session) {
      return jsonError("אין הרשאת אדמין להעלאת תמונה. התחברו מחדש ל־/admin/login", 401);
    }

    const contentType = request.headers.get("content-type") ?? "";
    let bytes: Buffer | null = null;

    // Prefer JSON (base64) — multipart previously hung on OneDrive / Windows.
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
      } else if (typeof body.base64 === "string" && body.base64.length > 0) {
        try {
          bytes = Buffer.from(body.base64.replace(/\s+/g, ""), "base64");
        } catch {
          return jsonError("base64 לא תקין");
        }
      } else {
        return jsonError("לא נשלחה תמונה");
      }
    } else if (contentType.includes("multipart/form-data")) {
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch {
        return jsonError("לא ניתן לקרוא את הקובץ (ייתכן שגדול מדי)");
      }
      const entry = formData.get("file");
      if (!entry || typeof entry === "string") return jsonError("לא נבחר קובץ תמונה");
      const blob = entry as Blob;
      if (typeof blob.arrayBuffer !== "function" || blob.size <= 0) {
        return jsonError("לא נבחר קובץ תמונה");
      }
      bytes = Buffer.from(await blob.arrayBuffer());
    } else {
      return jsonError("בקשת העלאה לא תקינה");
    }

    if (!bytes) return jsonError("לא נבחר קובץ תמונה");

    const result = await processMenuImageUpload(bytes);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[POST /api/admin/menu-image]", err instanceof Error ? err.message : err);
    return jsonError("העלאת התמונה נכשלה. נסו שוב או רעננו את הדף.", 500);
  }
}
