import { NextResponse } from "next/server";

import {
  generateStoryWithOpenAI,
  parseStoryGenerateRequestBody
} from "@/lib/admin/story-auto-fill/openai-generate";
import { getAdminApiSession } from "@/lib/auth/admin-api-session";
import { RATE_LIMITS } from "@/lib/constants";
import { consumeRateLimitAsync, getRequestClientIp } from "@/lib/security/rate-limit";

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
      return jsonError("אין הרשאת אדמין ליצירת תוכן. התחברו מחדש ל־/admin/login", 401);
    }

    const ip = await getRequestClientIp();
    const rateKey = `admin-story-generate:${session.email}:${ip}`;
    const allowed = await consumeRateLimitAsync(
      rateKey,
      RATE_LIMITS.storyGenerate.maxAttempts,
      RATE_LIMITS.storyGenerate.windowMs
    );
    if (!allowed) {
      return jsonError("חרגתם ממגבלת יצירת התוכן. נסו שוב מאוחר יותר.", 429);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("גוף הבקשה לא תקין");
    }

    const parsed = parseStoryGenerateRequestBody(body);
    if (!parsed.ok) {
      return jsonError(parsed.error, 400);
    }

    const result = await generateStoryWithOpenAI({
      input: parsed.input,
      excludeStoryId: parsed.excludeStoryId,
      acknowledgeOverlaps: parsed.acknowledgeOverlaps
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false as const, error: result.error },
        { status: result.status ?? 500 }
      );
    }

    if (result.blocked) {
      return NextResponse.json(
        {
          ok: true as const,
          blocked: true as const,
          warning: result.warning,
          warnings: result.warnings
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: true as const,
        blocked: false as const,
        fields: result.fields,
        warnings: result.warnings
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/admin/stories/generate]", err instanceof Error ? err.message : err);
    return jsonError("יצירת התוכן נכשלה. נסו שוב.", 500);
  }
}
