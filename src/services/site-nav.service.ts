import { getSiteNavConfig, saveSiteNavConfig } from "@/repositories/site-nav.repository";
import type { SiteNavConfig } from "@/types/content";

export async function getSiteNav(): Promise<SiteNavConfig> {
  return getSiteNavConfig();
}

export async function updateSiteNav(input: Partial<SiteNavConfig>): Promise<SiteNavConfig> {
  return saveSiteNavConfig(input);
}
