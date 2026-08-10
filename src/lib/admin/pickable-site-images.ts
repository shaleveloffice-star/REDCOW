import { STATIC_SITE_IMAGE_GROUPS } from "@/data/site-images.registry";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { pickSiteImage } from "@/lib/site-image-url";
import type { MenuItem } from "@/types/content";
import type { GalleryImage } from "@/types/gallery";
import type { SiteImagesMap } from "@/types/site-images";

export type AdminPickableImage = {
  id: string;
  label: string;
  location: string;
  imageUrl: string;
  group: string;
};

export function buildAdminPickableImages(
  siteImagesMap: SiteImagesMap,
  menuItems: MenuItem[] = [],
  galleryImages: GalleryImage[] = []
): AdminPickableImage[] {
  const seen = new Set<string>();
  const result: AdminPickableImage[] = [];

  for (const group of STATIC_SITE_IMAGE_GROUPS) {
    for (const item of group.items) {
      const url = pickSiteImage(siteImagesMap, item.id, item.imageUrl);
      if (!url || isVideoMediaUrl(url) || seen.has(url)) {
        continue;
      }

      seen.add(url);
      result.push({
        id: item.id,
        label: item.label,
        location: item.location,
        imageUrl: url,
        group: group.title
      });
    }
  }

  for (const item of menuItems) {
    const url = item.imageUrl?.trim();
    if (!url || isVideoMediaUrl(url) || seen.has(url)) {
      continue;
    }

    seen.add(url);
    result.push({
      id: `menu-${item.id}`,
      label: item.name,
      location: "תמונת מנה",
      imageUrl: url,
      group: "תפריט"
    });
  }

  for (const item of galleryImages) {
    const url = item.imageUrl?.trim();
    if (!url || isVideoMediaUrl(url) || seen.has(url)) {
      continue;
    }

    seen.add(url);
    result.push({
      id: `gallery-${item.id}`,
      label: item.title,
      location: item.alt?.trim() || "גלריה",
      imageUrl: url,
      group: "גלריה"
    });
  }

  return result;
}
