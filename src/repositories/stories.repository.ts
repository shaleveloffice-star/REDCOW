import { mockBrandStories } from "@/data/mock/stories.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localBrandStoriesStore } from "@/lib/firebase/local-stores";
import type { BrandStory } from "@/types/story";

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
  return storiesStore.save(input);
}

export async function deleteBrandStory(id: string): Promise<boolean> {
  return storiesStore.remove(id);
}
