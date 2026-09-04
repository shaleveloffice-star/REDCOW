import type { BrandStory } from "@/types/story";

import type { StoryAutoFillExistingStory } from "./types";

export type StoryContextSummary = {
  title: string;
  slug: string;
  category: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
};

const DEFAULT_STORY_CONTEXT_LIMIT = 50;

/** Compact story rows for OpenAI / cannibalization — never includes sections. */
export function buildStoryContextSummaries(
  stories: Array<
    Pick<
      BrandStory,
      "title" | "slug" | "category" | "subtitle" | "metaTitle" | "metaDescription" | "isActive"
    >
  >,
  options?: { limit?: number }
): StoryContextSummary[] {
  const limit = options?.limit ?? DEFAULT_STORY_CONTEXT_LIMIT;
  return stories.slice(0, limit).map((story) => ({
    title: story.title?.trim() || "",
    slug: story.slug?.trim() || "",
    category: story.category?.trim() || "",
    subtitle: (story.subtitle ?? "").trim().slice(0, 180),
    metaTitle: (story.metaTitle ?? "").trim().slice(0, 90),
    metaDescription: (story.metaDescription ?? "").trim().slice(0, 160),
    isActive: Boolean(story.isActive)
  }));
}

export function toStoryAutoFillExistingStories(
  stories: Array<
    Pick<
      BrandStory,
      "id" | "slug" | "title" | "subtitle" | "metaTitle" | "metaDescription" | "isActive"
    >
  >
): StoryAutoFillExistingStory[] {
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

/** Prefer an existing category label when the proposal is nearly identical. */
export function resolveStoryCategoryLabel(
  proposed: string,
  existingCategories: string[],
  fallbackByType?: string
): string {
  const cleaned = proposed.replace(/\s+/g, " ").trim().slice(0, 40);
  if (!cleaned) {
    return fallbackByType?.trim() || "מגזין";
  }

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[״"']/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const target = normalize(cleaned);
  const unique = [...new Set(existingCategories.map((c) => c.trim()).filter(Boolean))];

  for (const category of unique) {
    if (normalize(category) === target) return category;
  }
  for (const category of unique) {
    const n = normalize(category);
    if (n.includes(target) || target.includes(n)) {
      if (Math.abs(n.length - target.length) <= 4) return category;
    }
  }

  return cleaned;
}

export function categoryLabelForStoryType(
  storyType: "magazine" | "guide" | "brand" | "food" | "comparison" | "faq"
): string {
  switch (storyType) {
    case "guide":
      return "מדריכים";
    case "brand":
      return "הסיפור שלנו";
    case "food":
      return "אוכל";
    case "comparison":
      return "השוואות";
    case "faq":
      return "שאלות ותשובות";
    case "magazine":
    default:
      return "מגזין";
  }
}
