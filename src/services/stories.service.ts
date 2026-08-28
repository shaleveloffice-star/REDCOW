import {
  deleteBrandStory,
  getBrandStories,
  saveBrandStory
} from "@/repositories/stories.repository";
import { resolveStorySlug, isStoryInMagazine, normalizeStorySlug } from "@/lib/stories/story-slug";
import type { BrandStory } from "@/types/story";

export async function listBrandStories(
  options: { activeOnly?: boolean; magazineOnly?: boolean } = {}
): Promise<BrandStory[]> {
  const stories = await getBrandStories();
  let filtered = options.activeOnly ? stories.filter((story) => story.isActive) : stories;

  if (options.magazineOnly) {
    filtered = filtered.filter((story) => isStoryInMagazine(story));
  }

  return filtered.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export async function getBrandStoryBySlug(
  slug: string,
  options: { activeOnly?: boolean } = {}
): Promise<BrandStory | null> {
  const normalized = normalizeStorySlug(slug);
  if (!normalized) {
    return null;
  }

  const stories = await listBrandStories({ activeOnly: options.activeOnly });
  return (
    stories.find((story) => resolveStorySlug(story) === normalized) ??
    stories.find((story) => normalizeStorySlug(story.slug ?? "") === normalized) ??
    null
  );
}

export async function upsertBrandStory(input: BrandStory): Promise<BrandStory> {
  return saveBrandStory({ ...input, updatedAt: new Date().toISOString() });
}

export async function removeBrandStory(id: string): Promise<boolean> {
  return deleteBrandStory(id);
}
