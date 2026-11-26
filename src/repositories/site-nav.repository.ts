import { defaultSiteNavConfig, normalizeSiteNavItemIds } from "@/data/site-nav-defaults";
import { createFirestoreDocumentStore } from "@/lib/firebase/firestore-store";
import { localSiteNavStore } from "@/lib/firebase/local-stores";
import type { SiteNavConfig } from "@/types/content";

const store = createFirestoreDocumentStore<SiteNavConfig>(
  "siteSettings",
  "site-nav",
  localSiteNavStore
);

export function normalizeSiteNavConfig(
  input: Partial<SiteNavConfig> | null | undefined
): SiteNavConfig {
  const defaults = defaultSiteNavConfig();
  const raw = input ?? {};
  return {
    itemIds: normalizeSiteNavItemIds(raw.itemIds),
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.trim()
        ? raw.updatedAt
        : defaults.updatedAt
  };
}

export async function getSiteNavConfig(): Promise<SiteNavConfig> {
  try {
    return normalizeSiteNavConfig(await store.get());
  } catch (error) {
    console.error("[site-nav] read failed", error);
    return defaultSiteNavConfig();
  }
}

export async function saveSiteNavConfig(
  input: Partial<SiteNavConfig>
): Promise<SiteNavConfig> {
  const payload = normalizeSiteNavConfig({
    ...input,
    updatedAt: new Date().toISOString()
  });
  return store.save(payload);
}
