import { createJsonSingleDocStore } from "@/lib/admin/json-single-doc-store";
import { createFirestoreDocumentStore } from "@/lib/firebase/firestore-store";
import { DEFAULT_PAGE_VISIBILITY, normalizePageVisibility } from "@/lib/pages/page-visibility";
import type { PageVisibilityConfig } from "@/types/page-visibility";

const pageVisibilityStore = createFirestoreDocumentStore<PageVisibilityConfig>(
  "siteSettings",
  "page-visibility",
  createJsonSingleDocStore<PageVisibilityConfig>("page-visibility.json", DEFAULT_PAGE_VISIBILITY)
);

export async function getPageVisibility(): Promise<PageVisibilityConfig> {
  const stored = await pageVisibilityStore.get();
  return normalizePageVisibility({ ...DEFAULT_PAGE_VISIBILITY, ...stored });
}

export async function savePageVisibility(
  aboutEnabled: boolean
): Promise<PageVisibilityConfig> {
  return pageVisibilityStore.save({
    aboutEnabled,
    updatedAt: new Date().toISOString()
  });
}
