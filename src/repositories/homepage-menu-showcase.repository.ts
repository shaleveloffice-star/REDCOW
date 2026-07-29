import { createFirestoreDocumentStore } from "@/lib/firebase/firestore-store";
import { localHomepageMenuShowcaseStore } from "@/lib/firebase/local-stores";
import type { HomepageMenuShowcaseConfig } from "@/types/content";

const homepageMenuShowcaseStore = createFirestoreDocumentStore<HomepageMenuShowcaseConfig>(
  "homepageMenuShowcase",
  "default",
  localHomepageMenuShowcaseStore
);

export async function getHomepageMenuShowcaseConfig(): Promise<HomepageMenuShowcaseConfig> {
  try {
    const config = await homepageMenuShowcaseStore.get();
    return {
      itemIds: Array.isArray(config.itemIds)
        ? config.itemIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        : [],
      updatedAt: typeof config.updatedAt === "string" ? config.updatedAt : new Date(0).toISOString()
    };
  } catch (error) {
    console.error("[homepage-menu-showcase] read failed", error);
    return localHomepageMenuShowcaseStore.get();
  }
}

export async function saveHomepageMenuShowcaseConfig(
  itemIds: string[]
): Promise<HomepageMenuShowcaseConfig> {
  const uniqueIds = itemIds.filter((id, index) => itemIds.indexOf(id) === index);
  const payload: HomepageMenuShowcaseConfig = {
    itemIds: uniqueIds,
    updatedAt: new Date().toISOString()
  };
  return homepageMenuShowcaseStore.save(payload);
}
