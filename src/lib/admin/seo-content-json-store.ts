import { createJsonSingleDocStore } from "@/lib/admin/json-single-doc-store";
import { isReadOnlyServerless } from "@/lib/seo-content/local-seo-mirror";
import type { SeoContentDocument } from "@/types/seo-content";
const store = createJsonSingleDocStore("seo-content.json", {} as SeoContentDocument);
export const localSeoContentStore = {
  ...store,
  async saveOptional(input: SeoContentDocument): Promise<void> {
    if (isReadOnlyServerless()) return;
    try { await store.save(input); }
    catch (error) { console.warn("[seo-content] optional mirror failed", error); }
  }
};
