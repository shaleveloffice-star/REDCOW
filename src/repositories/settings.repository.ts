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

export async function getSiteSettings(): Promise<SiteSettings> {
  return siteSettingsStore.get();
}

export async function saveSiteSettings(input: SiteSettings): Promise<SiteSettings> {
  return siteSettingsStore.save(input);
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
