import { STORY_SECTION_TYPES, type StorySection } from "@/types/story";

import type { StoryAutoFillDraftFields, StoryAutoFillLength } from "./types";

/** Raw Structured Outputs payload from OpenAI (heroAlt naming). */
export type OpenAiStoryGeneratePayload = {
  title: string;
  slug: string;
  category: string;
  subtitle: string;
  heroAlt: string;
  metaTitle: string;
  metaDescription: string;
  sections: unknown[];
};

/**
 * Strict JSON Schema for OpenAI Responses Structured Outputs.
 * Uses a flat section object (all keys required; unused = "") so `strict: true` works reliably.
 */
export const STORY_GENERATE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "slug",
    "category",
    "subtitle",
    "heroAlt",
    "metaTitle",
    "metaDescription",
    "sections"
  ],
  properties: {
    title: {
      type: "string",
      description: "H1 / story title in Hebrew. One clear title only."
    },
    slug: {
      type: "string",
      description: "Short English kebab-case slug, e.g. food-in-raanana."
    },
    category: {
      type: "string",
      description: "Hebrew category label, e.g. מגזין."
    },
    subtitle: {
      type: "string",
      description: "Short supporting subtitle in Hebrew."
    },
    heroAlt: {
      type: "string",
      description: "Hebrew alt text for the hero image."
    },
    metaTitle: {
      type: "string",
      description: "SEO meta title, short and clear, Hebrew OK, max ~60 chars."
    },
    metaDescription: {
      type: "string",
      description: "Natural SEO meta description, Hebrew, max ~155 chars."
    },
    sections: {
      type: "array",
      description: "Story body sections using only allowed types.",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "type",
          "kicker",
          "title",
          "body",
          "imageAlt",
          "caption",
          "text",
          "attribution",
          "label",
          "href"
        ],
        properties: {
          type: {
            type: "string",
            enum: [...STORY_SECTION_TYPES]
          },
          kicker: { type: "string", description: "Optional kicker; empty string if unused." },
          title: { type: "string", description: "Section title / H2; empty if unused." },
          body: { type: "string", description: "Main body text; empty if unused." },
          imageAlt: { type: "string", description: "Image alt; empty if unused." },
          caption: { type: "string", description: "Full-image caption; empty if unused." },
          text: { type: "string", description: "Quote text; empty if unused." },
          attribution: { type: "string", description: "Quote attribution; empty if unused." },
          label: { type: "string", description: "CTA button label; empty if unused." },
          href: {
            type: "string",
            description: "CTA href: /menu, /locations, or empty if unused."
          }
        }
      }
    }
  }
} as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizeSection(raw: unknown): StorySection | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const type = typeof row.type === "string" ? row.type : "";

  if (type === "split-text-image" || type === "split-image-text") {
    if (!isNonEmptyString(row.title) || !isNonEmptyString(row.body)) return null;
    return {
      type,
      kicker: optionalString(row.kicker),
      title: row.title.trim(),
      body: row.body.trim(),
      imageUrl: "",
      imageAlt: optionalString(row.imageAlt) || `תמונה למקטע: ${row.title.trim()}`
    };
  }

  if (type === "full-image") {
    return {
      type: "full-image",
      imageUrl: "",
      imageAlt: optionalString(row.imageAlt) || "תמונה לכתבה",
      caption: optionalString(row.caption)
    };
  }

  if (type === "quote") {
    if (!isNonEmptyString(row.text)) return null;
    return {
      type: "quote",
      text: row.text.trim(),
      attribution: optionalString(row.attribution)
    };
  }

  if (type === "cta") {
    if (!isNonEmptyString(row.label)) return null;
    const hrefRaw = optionalString(row.href) || "/menu";
    const href =
      hrefRaw === "/locations" || hrefRaw.startsWith("/locations")
        ? "/locations"
        : hrefRaw === "/menu" || hrefRaw.startsWith("/menu")
          ? "/menu"
          : "/menu";
    return {
      type: "cta",
      body: optionalString(row.body),
      label: row.label.trim(),
      href
    };
  }

  if (type === "long-content") {
    if (!isNonEmptyString(row.body)) return null;
    return {
      type: "long-content",
      kicker: optionalString(row.kicker),
      title: optionalString(row.title),
      body: row.body.trim()
    };
  }

  return null;
}

export type StoryGenerateValidationResult =
  | { ok: true; fields: StoryAutoFillDraftFields }
  | { ok: false; error: string };

export function validateAndNormalizeStoryGeneratePayload(
  payload: unknown,
  options?: { length?: StoryAutoFillLength; expectCta?: boolean }
): StoryGenerateValidationResult {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "תשובת OpenAI אינה אובייקט תקין." };
  }

  const data = payload as Record<string, unknown>;
  const requiredKeys = [
    "title",
    "slug",
    "category",
    "subtitle",
    "heroAlt",
    "metaTitle",
    "metaDescription",
    "sections"
  ] as const;

  for (const key of requiredKeys) {
    if (key === "sections") {
      if (!Array.isArray(data.sections)) {
        return { ok: false, error: "חסר שדה sections בתשובה." };
      }
      continue;
    }
    if (!isNonEmptyString(data[key])) {
      return { ok: false, error: `חסר או ריק שדה חובה: ${key}` };
    }
  }

  const rawSections = data.sections as unknown[];
  const sections: StorySection[] = [];
  for (let i = 0; i < rawSections.length; i += 1) {
    const normalized = normalizeSection(rawSections[i]);
    if (!normalized) {
      return {
        ok: false,
        error: `מקטע ${i + 1} לא תקין או מסוג לא נתמך. לא עודכן הטופס.`
      };
    }
    sections.push(normalized);
  }

  if (sections.length === 0) {
    return { ok: false, error: "התשובה לא כללה מקטעים. לא עודכן הטופס." };
  }

  const contentSections = sections.filter((section) => section.type !== "cta");
  const hasCtaSection = sections.some((section) => section.type === "cta");

  const length = options?.length;
  if (length === "short" && contentSections.length !== 3) {
    return {
      ok: false,
      error: `לאורך קצר נדרשים בדיוק 3 מקטעי תוכן (התקבל ${contentSections.length}). לא עודכן הטופס.`
    };
  }
  if (length === "medium" && (contentSections.length < 4 || contentSections.length > 5)) {
    return {
      ok: false,
      error: `לאורך בינוני נדרשים 4–5 מקטעי תוכן (התקבל ${contentSections.length}). לא עודכן הטופס.`
    };
  }
  if (length === "long" && (contentSections.length < 5 || contentSections.length > 6)) {
    return {
      ok: false,
      error: `לאורך ארוך נדרשים 5–6 מקטעי תוכן (התקבל ${contentSections.length}). לא עודכן הטופס.`
    };
  }

  if (options?.expectCta && !hasCtaSection) {
    return {
      ok: false,
      error: "חסר מקטע CTA בתשובה. לא עודכן הטופס."
    };
  }

  if (options?.expectCta === false && hasCtaSection) {
    // Allow stripping? Prefer reject so admin sees issue.
    return {
      ok: false,
      error: "התשובה כללה CTA למרות שבחרתם בלעדיו. לא עודכן הטופס."
    };
  }

  const invalidType = sections.find(
    (section) => !(STORY_SECTION_TYPES as readonly string[]).includes(section.type)
  );
  if (invalidType) {
    return { ok: false, error: `סוג מקטע לא מורשה: ${invalidType.type}` };
  }

  return {
    ok: true,
    fields: {
      title: String(data.title).trim().slice(0, 120),
      slug: String(data.slug)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80),
      category: String(data.category).trim().slice(0, 60),
      subtitle: String(data.subtitle).trim().slice(0, 240),
      heroImageAlt: String(data.heroAlt).trim().slice(0, 160),
      metaTitle: String(data.metaTitle).trim().slice(0, 70),
      metaDescription: String(data.metaDescription).trim().slice(0, 170),
      ogImageSuggestion: "",
      sections
    }
  };
}
