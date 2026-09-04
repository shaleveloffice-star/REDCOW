import { NextResponse } from "next/server";

import { suggestStoriesWithOpenAI } from "@/lib/admin/story-auto-fill/openai-suggest";
import { getAdminApiSession } from "@/lib/auth/admin-api-session";
import { RATE_LIMITS } from "@/lib/constants";
import { consumeRateLimitAsync, getRequestClientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false as const, error }, { status });
}

export async function POST() {
  try {
    const session = await getAdminApiSession();
    if (!session) {
      return jsonError("אין הרשאת אדמין להצעת סיפורים. התחברו מחדש ל־/admin/login", 401);
    }

    const ip = await getRequestClientIp();
    const rateKey = `admin-story-suggest:${session.email}:${ip}`;
    const allowed = await consumeRateLimitAsync(
      rateKey,
      RATE_LIMITS.storySuggest.maxAttempts,
      RATE_LIMITS.storySuggest.windowMs
    );
    if (!allowed) {
      return jsonError("חרגתם ממגבלת הצעת הסיפורים. נסו שוב מאוחר יותר.", 429);
    }

    const result = await suggestStoriesWithOpenAI();
    if (!result.ok) {
      return NextResponse.json(
        { ok: false as const, error: result.error },
        { status: result.status ?? 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true as const,
        suggestions: result.suggestions,
        meta: result.meta
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/admin/stories/suggest]", err instanceof Error ? err.message : err);
    return jsonError("לא הצלחנו להציע סיפורים כרגע. נסו שוב.", 500);
  }
}
