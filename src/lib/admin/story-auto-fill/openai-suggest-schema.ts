import {
  STORY_AUTO_FILL_CTAS,
  STORY_AUTO_FILL_GOALS,
  STORY_AUTO_FILL_TYPES,
  type StoryAutoFillCta,
  type StoryAutoFillGoal,
  type StoryAutoFillType
} from "./types";
import type { StorySuggestion } from "./suggest-types";

export const STORY_SUGGEST_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["suggestions"],
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "primaryKeyword",
          "secondaryKeywords",
          "storyType",
          "category",
          "angle",
          "goal",
          "cta",
          "reason",
          "cannibalizationRisk",
          "conflictingPages"
        ],
        properties: {
          title: { type: "string" },
          primaryKeyword: { type: "string" },
          secondaryKeywords: {
            type: "array",
            items: { type: "string" }
          },
          storyType: {
            type: "string",
            enum: [...STORY_AUTO_FILL_TYPES]
          },
          category: { type: "string" },
          angle: { type: "string" },
          goal: {
            type: "string",
            enum: [...STORY_AUTO_FILL_GOALS]
          },
          cta: {
            type: "string",
            enum: [...STORY_AUTO_FILL_CTAS]
          },
          reason: { type: "string" },
          cannibalizationRisk: {
            type: "string",
            enum: ["low", "medium", "high"]
          },
          conflictingPages: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["label", "path", "keyword"],
              properties: {
                label: { type: "string" },
                path: { type: "string" },
                keyword: { type: "string" }
              }
            }
          }
        }
      }
    }
  }
} as const;

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export type SuggestPayloadValidation =
  | { ok: true; suggestions: Omit<StorySuggestion, "cannibalizationRisk" | "conflictingPages">[] }
  | { ok: false; error: string };

/** Validate raw OpenAI payload shape (risk/conflicts will be recomputed server-side). */
export function validateStorySuggestPayload(payload: unknown): SuggestPayloadValidation {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "תשובת OpenAI אינה אובייקט תקין." };
  }
  const data = payload as Record<string, unknown>;
  if (!Array.isArray(data.suggestions)) {
    return { ok: false, error: "חסר מערך suggestions." };
  }
  if (data.suggestions.length < 5) {
    return { ok: false, error: `נדרשות לפחות 5 הצעות (התקבל ${data.suggestions.length}).` };
  }

  const out: Array<Omit<StorySuggestion, "cannibalizationRisk" | "conflictingPages">> = [];

  for (let i = 0; i < 5; i += 1) {
    const row = data.suggestions[i];
    if (!row || typeof row !== "object") {
      return { ok: false, error: `הצעה ${i + 1} לא תקינה.` };
    }
    const item = row as Record<string, unknown>;
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const primaryKeyword =
      typeof item.primaryKeyword === "string" ? item.primaryKeyword.trim() : "";
    const angle = typeof item.angle === "string" ? item.angle.trim() : "";
    const category = typeof item.category === "string" ? item.category.trim() : "";
    const reason = typeof item.reason === "string" ? item.reason.trim() : "";

    if (!title || !primaryKeyword || !angle || !category || !reason) {
      return { ok: false, error: `הצעה ${i + 1} חסרה שדות חובה.` };
    }
    if (!isOneOf(item.storyType, STORY_AUTO_FILL_TYPES)) {
      return { ok: false, error: `הצעה ${i + 1}: storyType לא תקין.` };
    }
    if (!isOneOf(item.goal, STORY_AUTO_FILL_GOALS)) {
      return { ok: false, error: `הצעה ${i + 1}: goal לא תקין.` };
    }
    if (!isOneOf(item.cta, STORY_AUTO_FILL_CTAS)) {
      return { ok: false, error: `הצעה ${i + 1}: cta לא תקין.` };
    }

    out.push({
      title: title.slice(0, 100),
      primaryKeyword: primaryKeyword.slice(0, 80),
      secondaryKeywords: asStringArray(item.secondaryKeywords),
      storyType: item.storyType as StoryAutoFillType,
      category: category.slice(0, 40),
      angle: angle.slice(0, 160),
      goal: item.goal as StoryAutoFillGoal,
      cta: item.cta as StoryAutoFillCta,
      reason: reason.slice(0, 280)
    });
  }

  return { ok: true, suggestions: out };
}
