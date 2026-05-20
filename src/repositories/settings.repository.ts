import { mockOrderLinks, mockSiteSettings } from "@/data/mock/settings.mock";
import { createInMemoryStore } from "@/lib/admin/in-memory-store";
import type { OrderLink, SiteSettings } from "@/types/content";

let localSiteSettings = { ...mockSiteSettings };
const orderLinksStore = createInMemoryStore(mockOrderLinks);

export async function getSiteSettings(): Promise<SiteSettings> {
  return { ...localSiteSettings };
}

export async function saveSiteSettings(input: SiteSettings): Promise<SiteSettings> {
  localSiteSettings = { ...input };
  return localSiteSettings;
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
