import "server-only";

import OpenAI from "openai";
import { APIError } from "openai";

import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { listBrandStories } from "@/services/stories.service";

import { findStoryCannibalizationHits } from "./cannibalization";
import {
  STORY_AUTO_FILL_OPENAI_MODEL,
  STORY_AUTO_FILL_OPENAI_TIMEOUT_MS
} from "./openai-model";
import { buildStoryGenerateUserPrompt, STORY_GENERATE_BRAND_INSTRUCTIONS } from "./openai-prompt";
import {
  STORY_GENERATE_JSON_SCHEMA,
  validateAndNormalizeStoryGeneratePayload
} from "./openai-schema";
import { buildStoryAutoFillSlug } from "./slug";
import type {
  StoryAutoFillDraftFields,
  StoryAutoFillExistingStory,
  StoryAutoFillInput,
  StoryCannibalizationHit
} from "./types";
import {
  STORY_AUTO_FILL_CTAS,
  STORY_AUTO_FILL_GOALS,
  STORY_AUTO_FILL_LENGTHS,
  STORY_AUTO_FILL_TYPES
} from "./types";

export type StoryGenerateCannibalizationWarning = {
  type: "cannibalization";
  conflictingPages: Array<{
    label: string;
    path: string;
    keyword: string;
    reason: string;
  }>;
  suggestedAngle: string;
};

export type StoryGenerateSuccess = {
  ok: true;
  fields: StoryAutoFillDraftFields;
  blocked: false;
  warnings: StoryCannibalizationHit[];
  warning?: undefined;
};

export type StoryGenerateBlocked = {
  ok: true;
  fields?: undefined;
  blocked: true;
  warnings: StoryCannibalizationHit[];
  warning: StoryGenerateCannibalizationWarning;
};

export type StoryGenerateFailure = {
  ok: false;
  error: string;
  status?: number;
};

export type StoryGenerateResult = StoryGenerateSuccess | StoryGenerateBlocked | StoryGenerateFailure;

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

export function parseStoryGenerateRequestBody(body: unknown):
  | { ok: true; input: StoryAutoFillInput; excludeStoryId?: string; acknowledgeOverlaps: boolean }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "גוף הבקשה לא תקין." };
  }
  const raw = body as Record<string, unknown>;

  const primaryKeyword = typeof raw.primaryKeyword === "string" ? raw.primaryKeyword.trim() : "";
  if (!primaryKeyword) {
    return { ok: false, error: "מילת מפתח ראשית נדרשת." };
  }

  let secondaryKeywords = "";
  if (typeof raw.secondaryKeywords === "string") {
    secondaryKeywords = raw.secondaryKeywords;
  } else if (Array.isArray(raw.secondaryKeywords)) {
    secondaryKeywords = raw.secondaryKeywords
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");
  }

  if (!isOneOf(raw.storyType, STORY_AUTO_FILL_TYPES)) {
    return { ok: false, error: "סוג סיפור לא תקין." };
  }
  if (!isOneOf(raw.length, STORY_AUTO_FILL_LENGTHS)) {
    return { ok: false, error: "אורך לא תקין." };
  }
  if (!isOneOf(raw.goal, STORY_AUTO_FILL_GOALS)) {
    return { ok: false, error: "מטרה לא תקינה." };
  }
  if (!isOneOf(raw.cta, STORY_AUTO_FILL_CTAS)) {
    return { ok: false, error: "CTA לא תקין." };
  }

  const angle = typeof raw.angle === "string" ? raw.angle.trim() : "";
  const excludeStoryId =
    typeof raw.excludeStoryId === "string" && raw.excludeStoryId.trim()
      ? raw.excludeStoryId.trim()
      : undefined;
  const acknowledgeOverlaps = raw.acknowledgeOverlaps === true;

  return {
    ok: true,
    input: {
      primaryKeyword,
      secondaryKeywords,
      storyType: raw.storyType,
      angle,
      length: raw.length,
      goal: raw.goal,
      cta: raw.cta
    },
    excludeStoryId,
    acknowledgeOverlaps
  };
}

function toExistingStorySummaries(stories: Awaited<ReturnType<typeof listBrandStories>>): StoryAutoFillExistingStory[] {
  return stories.map((story) => ({
    id: story.id,
    slug: story.slug,
    title: story.title,
    subtitle: story.subtitle,
    metaTitle: story.metaTitle,
    metaDescription: story.metaDescription,
    isActive: story.isActive
  }));
}

function buildCannibalizationWarning(hits: StoryCannibalizationHit[]): StoryGenerateCannibalizationWarning {
  return {
    type: "cannibalization",
    conflictingPages: hits.map((hit) => ({
      label: hit.label,
      path: hit.path,
      keyword: hit.keyword,
      reason: hit.reason
    })),
    suggestedAngle: hits[0]?.suggestedAngle ?? "שנו את הזווית או את מילת המפתח הראשית."
  };
}

function mapOpenAiError(err: unknown): StoryGenerateFailure {
  if (err instanceof APIError) {
    if (err.status === 429) {
      return {
        ok: false,
        error: "OpenAI החזיר 429 (יותר מדי בקשות). נסו שוב בעוד כמה דקות.",
        status: 429
      };
    }
    if (err.status && err.status >= 500) {
      return {
        ok: false,
        error: "שירות OpenAI לא זמין כרגע (שגיאת שרת). נסו שוב מאוחר יותר.",
        status: 502
      };
    }
    return {
      ok: false,
      error: "יצירת התוכן מול OpenAI נכשלה. בדקו את ההגדרות ונסו שוב.",
      status: err.status && err.status >= 400 && err.status < 500 ? 400 : 502
    };
  }

  if (err instanceof Error) {
    const name = err.name.toLowerCase();
    const message = err.message.toLowerCase();
    if (name.includes("abort") || message.includes("abort") || message.includes("timeout")) {
      return {
        ok: false,
        error: "יצירת התוכן חרגה מזמן ההמתנה. נסו שוב.",
        status: 504
      };
    }
  }

  return {
    ok: false,
    error: "יצירת התוכן נכשלה. נסו שוב.",
    status: 500
  };
}

function ensureSlug(fields: StoryAutoFillDraftFields, input: StoryAutoFillInput): StoryAutoFillDraftFields {
  if (fields.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug)) {
    return fields;
  }
  return {
    ...fields,
    slug: buildStoryAutoFillSlug([input.primaryKeyword, input.storyType, input.angle || "story"])
  };
}

export async function generateStoryWithOpenAI(options: {
  input: StoryAutoFillInput;
  excludeStoryId?: string;
  acknowledgeOverlaps?: boolean;
}): Promise<StoryGenerateResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: "OPENAI_API_KEY לא מוגדר בשרת. הוסיפו את המפתח ב־Vercel (או בסביבה המקומית) ופרסו מחדש.",
      status: 503
    };
  }

  const stories = await listBrandStories();
  const existingStories = toExistingStorySummaries(stories);
  const warnings = findStoryCannibalizationHits(options.input, existingStories, {
    excludeStoryId: options.excludeStoryId
  });

  const blocked = warnings.some(
    (hit) => hit.source !== "story" || hit.reason.includes("מפורסם")
  );

  if (blocked && !options.acknowledgeOverlaps) {
    return {
      ok: true,
      blocked: true,
      warnings,
      warning: buildCannibalizationWarning(warnings)
    };
  }

  const client = new OpenAI({
    apiKey,
    timeout: STORY_AUTO_FILL_OPENAI_TIMEOUT_MS,
    maxRetries: 0
  });

  try {
    const response = await client.responses.create({
      model: STORY_AUTO_FILL_OPENAI_MODEL,
      input: [
        { role: "system", content: STORY_GENERATE_BRAND_INSTRUCTIONS },
        {
          role: "user",
          content: buildStoryGenerateUserPrompt({
            input: options.input,
            existingStories
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "nb_burger_story",
          strict: true,
          schema: STORY_GENERATE_JSON_SCHEMA as unknown as Record<string, unknown>
        }
      }
    });

    const outputText = response.output_text?.trim();
    if (!outputText) {
      return {
        ok: false,
        error: "OpenAI החזיר תשובה ריקה. לא עודכן הטופס.",
        status: 502
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      return {
        ok: false,
        error: "תשובת OpenAI אינה JSON תקין. לא עודכן הטופס.",
        status: 502
      };
    }

    const expectCta = options.input.cta !== "none";
    const validated = validateAndNormalizeStoryGeneratePayload(parsed, {
      length: options.input.length,
      expectCta
    });

    if (!validated.ok) {
      return { ok: false, error: validated.error, status: 422 };
    }

    const fields = ensureSlug(
      {
        ...validated.fields,
        ogImageSuggestion: DEFAULT_OG_IMAGE
      },
      options.input
    );

    return {
      ok: true,
      blocked: false,
      fields,
      warnings
    };
  } catch (err) {
    console.error(
      "[generateStoryWithOpenAI]",
      err instanceof APIError ? `status=${err.status} code=${err.code ?? ""}` : err instanceof Error ? err.message : err
    );
    return mapOpenAiError(err);
  }
}
