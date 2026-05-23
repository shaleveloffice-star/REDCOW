import {
  deleteSiteImageOverride,
  getSiteImageOverrides,
  saveSiteImageOverride
} from "@/repositories/site-image-overrides.repository";
import type { SiteImageOverride } from "@/types/site-images";

export async function listSiteImageOverrides(): Promise<SiteImageOverride[]> {
  return getSiteImageOverrides();
}

export async function upsertSiteImageOverride(input: {
  id: string;
  imageUrl?: string;
  label?: string;
  hidden?: boolean;
}): Promise<SiteImageOverride> {
  const existing = await getSiteImageOverrides();
  const current = existing.find((entry) => entry.id === input.id);

  return saveSiteImageOverride({
    id: input.id,
    imageUrl: input.imageUrl !== undefined ? input.imageUrl : current?.imageUrl,
    label: input.label !== undefined ? input.label : current?.label,
    hidden: input.hidden !== undefined ? input.hidden : current?.hidden,
    updatedAt: new Date().toISOString()
  });
}

export async function hideSiteImageOverride(id: string): Promise<SiteImageOverride> {
  return upsertSiteImageOverride({ id, hidden: true });
}

export async function clearSiteImageOverride(id: string): Promise<boolean> {
  return deleteSiteImageOverride(id);
}
