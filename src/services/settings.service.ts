import {
  deleteOrderLink,
  getOrderLinks,
  getSiteSettings,
  saveOrderLink,
  saveSiteSettings
} from "@/repositories/settings.repository";
import type { OrderLink, SiteSettings } from "@/types/content";

export async function getSettings(): Promise<SiteSettings> {
  return getSiteSettings();
}

export async function updateSettings(input: SiteSettings): Promise<SiteSettings> {
  return saveSiteSettings({ ...input, updatedAt: new Date().toISOString() });
}

export async function listOrderLinks(options: { activeOnly?: boolean } = {}): Promise<OrderLink[]> {
  const links = await getOrderLinks();
  return links
    .filter((link) => (options.activeOnly ? link.isActive : true))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function upsertOrderLink(input: OrderLink): Promise<OrderLink> {
  return saveOrderLink({ ...input, updatedAt: new Date().toISOString() });
}

export async function removeOrderLink(id: string): Promise<boolean> {
  return deleteOrderLink(id);
}
