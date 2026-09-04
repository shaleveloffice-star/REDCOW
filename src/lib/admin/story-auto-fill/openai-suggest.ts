import "server-only";

import OpenAI from "openai";
import { APIError } from "openai";

import { listBrandStories } from "@/services/stories.service";

import {
  findStoryCannibalizationHits,
  scoreCannibalizationRisk,
  type SeoCannibalizationCluster
} from "./cannibalization";
import {
  STORY_AUTO_FILL_OPENAI_MODEL,
  STORY_AUTO_FILL_OPENAI_TIMEOUT_MS
} from "./openai-model";
import {
  buildStorySuggestUserPrompt,
  STORY_SUGGEST_BRAND_INSTRUCTIONS
} from "./openai-suggest-prompt";
import {
  STORY_SUGGEST_JSON_SCHEMA,
  validateStorySuggestPayload
} from "./openai-suggest-schema";
import { loadSeoSuggestContext } from "./seo-context";
import type { StorySuggestion, StorySuggestionConflict } from "./suggest-types";
import {
  buildStoryContextSummaries,
  categoryLabelForStoryType,
  resolveStoryCategoryLabel,
  toStoryAutoFillExistingStories
} from "./story-context";
import type { StoryAutoFillExistingStory, StoryAutoFillInput } from "./types";

export type StorySuggestSuccess = {
  ok: true;
  suggestions: StorySuggestion[];
  meta: {
    sourcesLoaded: string[];
    sourcesMissing: string[];
  };
};

export type StorySuggestFailure = {
  ok: false;
  error: string;
  status?: number;
};

export type StorySuggestResult = StorySuggestSuccess | StorySuggestFailure;

function mapOpenAiError(err: unknown): StorySuggestFailure {
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
        error: "שירות OpenAI לא זמין כרגע. נסו שוב מאוחר יותר.",
        status: 502
      };
    }
    return {
      ok: false,
      error: "לא הצלחנו להציע סיפורים כרגע. נסו שוב.",
      status: err.status && err.status >= 400 && err.status < 500 ? 400 : 502
    };
  }

  if (err instanceof Error) {
    const message = err.message.toLowerCase();
    if (err.name.toLowerCase().includes("abort") || message.includes("timeout") || message.includes("abort")) {
      return {
        ok: false,
        error: "הבקשה חרגה מזמן ההמתנה. נסו שוב.",
        status: 504
      };
    }
  }

  return {
    ok: false,
    error: "לא הצלחנו להציע סיפורים כרגע. נסו שוב.",
    status: 500
  };
}

function suggestionToInput(
  suggestion: Omit<StorySuggestion, "cannibalizationRisk" | "conflictingPages">
): StoryAutoFillInput {
  return {
    primaryKeyword: suggestion.primaryKeyword,
    secondaryKeywords: suggestion.secondaryKeywords.join(", "),
    storyType: suggestion.storyType,
    angle: suggestion.angle,
    length: "medium",
    goal: suggestion.goal,
    cta: suggestion.cta
  };
}

function decorateSuggestion(
  raw: Omit<StorySuggestion, "cannibalizationRisk" | "conflictingPages">,
  existingStories: StoryAutoFillExistingStory[],
  extraClusters: SeoCannibalizationCluster[],
  existingCategories: string[]
): StorySuggestion {
  const category = resolveStoryCategoryLabel(
    raw.category,
    existingCategories,
    categoryLabelForStoryType(raw.storyType)
  );

  const hits = findStoryCannibalizationHits(
    suggestionToInput({ ...raw, category }),
    existingStories,
    {
      extraClusters,
      extraProbeTexts: [raw.title, raw.angle, category]
    }
  );

  const conflictingPages: StorySuggestionConflict[] = [];
  const seen = new Set<string>();
  for (const hit of hits) {
    const key = `${hit.path}|${hit.keyword}`;
    if (seen.has(key)) continue;
    seen.add(key);
    conflictingPages.push({
      label: hit.label,
      path: hit.path,
      keyword: hit.keyword
    });
  }

  return {
    ...raw,
    category,
    cannibalizationRisk: scoreCannibalizationRisk(hits),
    conflictingPages
  };
}

function dedupeKey(suggestion: Pick<StorySuggestion, "primaryKeyword" | "title" | "angle">): string {
  return [suggestion.primaryKeyword, suggestion.title, suggestion.angle]
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function mergeUnique(target: StorySuggestion[], incoming: StorySuggestion[]): StorySuggestion[] {
  const seen = new Set(target.map(dedupeKey));
  const next = [...target];
  for (const item of incoming) {
    const key = dedupeKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(item);
  }
  return next;
}

function pickFinalSuggestions(candidates: StorySuggestion[]): StorySuggestion[] {
  const low = candidates.filter((item) => item.cannibalizationRisk === "low");
  const medium = candidates.filter((item) => item.cannibalizationRisk === "medium");
  // Never surface high-risk as a normal recommendation.
  return [...low, ...medium].slice(0, 5);
}

async function callOpenAiSuggest(options: {
  client: OpenAI;
  stories: ReturnType<typeof buildStoryContextSummaries>;
  seoPages: Awaited<ReturnType<typeof loadSeoSuggestContext>>["pages"];
  existingCategories: string[];
  avoidKeywords: string[];
}): Promise<
  | {
      ok: true;
      raw: Array<Omit<StorySuggestion, "cannibalizationRisk" | "conflictingPages">>;
    }
  | { ok: false; error: string; status?: number }
> {
  const response = await options.client.responses.create({
    model: STORY_AUTO_FILL_OPENAI_MODEL,
    input: [
      { role: "system", content: STORY_SUGGEST_BRAND_INSTRUCTIONS },
      {
        role: "user",
        content: buildStorySuggestUserPrompt({
          stories: options.stories,
          seoPages: options.seoPages,
          existingCategories: options.existingCategories,
          avoidKeywords: options.avoidKeywords,
          neededCount: 5
        })
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "nb_burger_story_suggestions",
        strict: true,
        schema: STORY_SUGGEST_JSON_SCHEMA as unknown as Record<string, unknown>
      }
    }
  });

  const outputText = response.output_text?.trim();
  if (!outputText) {
    return { ok: false, error: "OpenAI החזיר תשובה ריקה.", status: 502 };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(outputText);
  } catch {
    return { ok: false, error: "תשובת OpenAI אינה JSON תקין.", status: 502 };
  }

  const validated = validateStorySuggestPayload(parsed);
  if (!validated.ok) {
    return { ok: false, error: validated.error, status: 422 };
  }

  return { ok: true, raw: validated.suggestions };
}

export async function suggestStoriesWithOpenAI(): Promise<StorySuggestResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: "OPENAI_API_KEY לא מוגדר בשרת. הוסיפו את המפתח ב־Vercel (או בסביבה המקומית) ופרסו מחדש.",
      status: 503
    };
  }

  const [stories, seoContext] = await Promise.all([listBrandStories(), loadSeoSuggestContext()]);
  const existingStories = toStoryAutoFillExistingStories(stories);
  const storySummaries = buildStoryContextSummaries(stories, { limit: 50 });
  const existingCategories = [
    ...new Set(stories.map((story) => story.category.trim()).filter(Boolean))
  ];

  const client = new OpenAI({
    apiKey,
    timeout: STORY_AUTO_FILL_OPENAI_TIMEOUT_MS,
    maxRetries: 0
  });

  try {
    const first = await callOpenAiSuggest({
      client,
      stories: storySummaries,
      seoPages: seoContext.pages,
      existingCategories,
      avoidKeywords: []
    });

    if (!first.ok) {
      return {
        ok: false,
        error: first.error.includes("תשובה") || first.error.includes("JSON") || first.error.includes("הצעות")
          ? "לא הצלחנו להציע סיפורים כרגע. נסו שוב."
          : first.error,
        status: first.status
      };
    }

    let candidates = first.raw.map((raw) =>
      decorateSuggestion(raw, existingStories, seoContext.clusters, existingCategories)
    );

    let selected = pickFinalSuggestions(candidates);

    if (selected.length < 5) {
      const avoidKeywords = [
        ...candidates.map((item) => item.primaryKeyword),
        ...candidates.filter((item) => item.cannibalizationRisk === "high").map((item) => item.title),
        ...selected.map((item) => item.angle)
      ];

      const second = await callOpenAiSuggest({
        client,
        stories: storySummaries,
        seoPages: seoContext.pages,
        existingCategories,
        avoidKeywords
      });

      if (second.ok) {
        const more = second.raw.map((raw) =>
          decorateSuggestion(raw, existingStories, seoContext.clusters, existingCategories)
        );
        candidates = mergeUnique(candidates, more);
        selected = pickFinalSuggestions(candidates);
      }
    }

    if (selected.length === 0) {
      return {
        ok: false,
        error: "לא נמצאו הצעות בטוחות מספיק מול תוכן קיים. נסו שוב מאוחר יותר.",
        status: 422
      };
    }

    return {
      ok: true,
      suggestions: selected.slice(0, 5),
      meta: {
        sourcesLoaded: seoContext.sourcesLoaded,
        sourcesMissing: seoContext.sourcesMissing
      }
    };
  } catch (err) {
    console.error(
      "[suggestStoriesWithOpenAI]",
      err instanceof APIError ? `status=${err.status} code=${err.code ?? ""}` : err instanceof Error ? err.message : err
    );
    return mapOpenAiError(err);
  }
}
