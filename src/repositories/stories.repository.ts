import { mockBrandStories } from "@/data/mock/stories.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localBrandStoriesStore } from "@/lib/firebase/local-stores";
import type { BrandStory } from "@/types/story";
import { mutateCollection } from "@/lib/firebase/atomic-collection";
import { resolveStorySlug } from "@/lib/stories/story-slug";

const storiesStore = createFirestoreCollectionStore("brandStories", localBrandStoriesStore, {
  access: "public",
  seed: mockBrandStories
});

export async function getBrandStories(): Promise<BrandStory[]> {
  return storiesStore.getAll();
}

export async function getBrandStoryById(id: string): Promise<BrandStory | null> {
  return storiesStore.getById(id);
}

export async function saveBrandStory(input: BrandStory): Promise<BrandStory> {
  return mutateCollection("brandStories", localBrandStoriesStore, rows => {
    const slug = resolveStorySlug(input);
    if (rows.some(row => row.id !== input.id && (resolveStorySlug(row) === slug || row.previousSlugs?.includes(slug)))) throw new Error("Slug כבר משמש סיפור אחר");
    const current = rows.find(row => row.id === input.id);
    const saved = { ...current, ...input, previousSlugs: [...new Set([...(current?.previousSlugs ?? []), ...(current ? [resolveStorySlug(current)] : [])])].filter(value => value !== slug) };
    for (const field of ["metaTitle", "metaDescription", "ogImageUrl"] as const) if (!input[field]) delete saved[field];
    return { result: saved, upserts: [saved] };
  });
}

export async function deleteBrandStory(id: string): Promise<boolean> {
  return storiesStore.remove(id);
}
