import { BUSINESS } from "@/data/business";
import { mockOrderLinks, mockSiteSettings } from "@/data/mock/settings.mock";
import {
  createFirestoreCollectionStore,
  createFirestoreDocumentStore
} from "@/lib/firebase/firestore-store";
import { localOrderLinksStore, localSiteSettingsStore } from "@/lib/firebase/local-stores";
import type { OrderLink, SiteSettings } from "@/types/content";

const siteSettingsStore = createFirestoreDocumentStore(
  "siteSettings",
  "default",
  localSiteSettingsStore,
  mockSiteSettings
);
const orderLinksStore = createFirestoreCollectionStore("orderLinks", localOrderLinksStore, {
  access: "public",
  seed: mockOrderLinks
});

function withCanonicalBusinessEmail(settings: SiteSettings): SiteSettings {
  if (settings.email === BUSINESS.email) return settings;
  return { ...settings, email: BUSINESS.email };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = await siteSettingsStore.get();
  const settings = withCanonicalBusinessEmail(raw);
  if (raw.email !== BUSINESS.email) {
    try {
      await siteSettingsStore.save(settings);
    } catch (error) {
      console.error("[settings] email heal failed", error);
    }
  }
  return settings;
}

export async function saveSiteSettings(input: SiteSettings): Promise<SiteSettings> {
  return siteSettingsStore.save(withCanonicalBusinessEmail(input));
}

export async function getOrderLinks(): Promise<OrderLink[]> {
  return orderLinksStore.getAll();
}

export async function saveOrderLink(input: OrderLink): Promise<OrderLink> {
  return orderLinksStore.save(input);
}

export async function deleteOrderLink(id: string): Promise<boolean> {
  return orderLinksStore.remove(id);
}
