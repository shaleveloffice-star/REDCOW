import type { BrandStory } from "@/types/story";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeStorySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function isValidStorySlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function resolveStorySlug(story: { slug?: string; title: string; id: string }): string {
  const fromSlug = normalizeStorySlug(story.slug ?? "");
  if (fromSlug && isValidStorySlug(fromSlug)) {
    return fromSlug;
  }

  const fromTitle = normalizeStorySlug(story.title);
  if (fromTitle && isValidStorySlug(fromTitle)) {
    return fromTitle;
  }

  return normalizeStorySlug(story.id) || story.id;
}

/** Active stories opted in to the public magazine index and nav dropdown. */
export function isStoryInMagazine(story: Pick<BrandStory, "isActive" | "showInMagazine">): boolean {
  return story.isActive && story.showInMagazine !== false;
}
