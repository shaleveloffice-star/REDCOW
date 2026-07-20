import { NextResponse } from "next/server";

import { saveMenuItemCore } from "@/lib/admin/save-menu-item";
import { getAdminApiSession } from "@/lib/auth/admin-api-session";
import type { MenuItem } from "@/types/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false as const, error }, { status });
}

export async function POST(request: Request) {
  try {
    const session = await getAdminApiSession();
    if (!session) {
      return jsonError("אין הרשאת אדמין. התחברו מחדש ל־/admin/login", 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("גוף הבקשה לא תקין");
    }

    if (!body || typeof body !== "object") {
      return jsonError("גוף הבקשה לא תקין");
    }

    const result = await saveMenuItemCore(body as MenuItem);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.error("[POST /api/admin/menu-item]", detail);
    return jsonError(`שמירת המנה נכשלה: ${detail}`, 500);
  }
}
