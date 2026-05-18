import { mockOrderLinks, mockSiteSettings } from "@/data/mock/settings.mock";
import type { OrderLink, SiteSettings } from "@/types/content";

let localSiteSettings = mockSiteSettings;
let localOrderLinks = mockOrderLinks;

export async function getSiteSettings(): Promise<SiteSettings> {
  return localSiteSettings;
}

export async function saveSiteSettings(input: SiteSettings): Promise<SiteSettings> {
  localSiteSettings = input;
  return localSiteSettings;
}

export async function getOrderLinks(): Promise<OrderLink[]> {
  return localOrderLinks;
}

export async function saveOrderLink(input: OrderLink): Promise<OrderLink> {
  localOrderLinks = localOrderLinks.map((link) => (link.id === input.id ? input : link));
  return input;
}
