import { STATIC_SITE_IMAGE_GROUPS } from "@/data/site-images.registry";
import { listSiteImageOverrides } from "@/services/site-image-overrides.service";
import type { SiteImageCatalogItem, SiteImagesMap } from "@/types/site-images";

export function applySiteImageOverrides(
  items: SiteImageCatalogItem[],
  overrides: Awaited<ReturnType<typeof listSiteImageOverrides>>
): SiteImageCatalogItem[] {
  const overrideMap = new Map(overrides.map((entry) => [entry.id, entry]));

  return items
    .map((entry) => {
      const override = overrideMap.get(entry.id);
      if (override?.hidden) {
        return null;
      }
      return {
        ...entry,
        label: override?.label?.trim() || entry.label,
        imageUrl: override?.imageUrl?.trim() || entry.imageUrl
      };
    })
    .filter((entry): entry is SiteImageCatalogItem => entry !== null);
}

export async function resolveStaticSiteImagesMap(): Promise<SiteImagesMap> {
  const overrides = await listSiteImageOverrides();
  const overrideMap = new Map(overrides.map((entry) => [entry.id, entry]));
  const map: SiteImagesMap = {};

  for (const group of STATIC_SITE_IMAGE_GROUPS) {
    for (const entry of group.items) {
      const override = overrideMap.get(entry.id);
      if (override?.hidden) {
        map[entry.id] = "";
        continue;
      }
      map[entry.id] = override?.imageUrl?.trim() || entry.imageUrl;
    }
  }

  return map;
}
