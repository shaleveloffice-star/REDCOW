import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localSiteImageOverridesStore } from "@/lib/firebase/local-stores";
import type { SiteImageOverride } from "@/types/site-images";

const overridesStore = createFirestoreCollectionStore(
  "siteImageOverrides",
  localSiteImageOverridesStore
);

export async function getSiteImageOverrides(): Promise<SiteImageOverride[]> {
  return overridesStore.getAll();
}

export async function getSiteImageOverrideById(id: string): Promise<SiteImageOverride | null> {
  return overridesStore.getById(id);
}

export async function saveSiteImageOverride(input: SiteImageOverride): Promise<SiteImageOverride> {
  return overridesStore.save(input);
}

export async function deleteSiteImageOverride(id: string): Promise<boolean> {
  return overridesStore.remove(id);
}
