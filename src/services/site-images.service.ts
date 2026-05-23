import { STATIC_SITE_IMAGE_GROUPS } from "@/data/site-images.registry";
import { applySiteImageOverrides } from "@/services/site-images-resolver.service";
import { listSiteImageOverrides } from "@/services/site-image-overrides.service";
import { listGalleryItems } from "@/services/gallery.service";
import { listMenuItems } from "@/services/menu.service";
import { listPressItems } from "@/services/press.service";
import { getSettings } from "@/services/settings.service";
import type { SiteImageCatalogItem, SiteImageGroup, SiteImageSource } from "@/types/site-images";

function catalogItem(
  id: string,
  label: string,
  location: string,
  imageUrl: string,
  source: SiteImageSource,
  defaultImageUrl: string,
  entityId?: string
): SiteImageCatalogItem {
  return {
    id,
    label,
    location,
    imageUrl: imageUrl.trim(),
    source,
    defaultImageUrl,
    entityId
  };
}

function group(title: string, items: SiteImageCatalogItem[]): SiteImageGroup | null {
  const filtered = items.filter((entry) => entry.imageUrl.length > 0);
  if (filtered.length === 0) {
    return null;
  }
  return { title, items: filtered };
}

export async function getSiteImagesCatalog(): Promise<SiteImageGroup[]> {
  const [overrides, settings, menuItems, galleryItems, pressItems] = await Promise.all([
    listSiteImageOverrides(),
    getSettings(),
    listMenuItems(),
    listGalleryItems(),
    listPressItems()
  ]);

  const staticGroups = STATIC_SITE_IMAGE_GROUPS.map((entry) => ({
    title: entry.title,
    items: applySiteImageOverrides(entry.items, overrides)
  })).filter((entry) => entry.items.length > 0);

  const dynamicGroups = [
    group("הגדרות אתר", [
      settings.heroMediaType === "image" && settings.heroMediaUrl
        ? catalogItem(
            "settings-hero",
            "תמונת גיבור (ראשי)",
            "דף הבית — גיבור / הגדרות אתר",
            settings.heroMediaUrl,
            "settings-hero",
            settings.heroMediaUrl
          )
        : null,
      settings.heroMediaType === "video" && settings.heroMediaUrl
        ? catalogItem(
            "settings-hero-video",
            "סרטון גיבור",
            "דף הבית — גיבור / הגדרות אתר",
            settings.heroMediaUrl,
            "settings-hero-video",
            settings.heroMediaUrl
          )
        : null,
      settings.ogImageUrl
        ? catalogItem(
            "settings-og",
            "תמונת שיתוף (OG)",
            "מטא / שיתוף ברשתות",
            settings.ogImageUrl,
            "settings-og",
            settings.ogImageUrl
          )
        : null
    ].filter((entry): entry is SiteImageCatalogItem => entry !== null)),
    group(
      "תפריט — מנות",
      menuItems.map((menuItem) =>
        catalogItem(
          `menu-${menuItem.id}`,
          menuItem.name,
          `תפריט${menuItem.isActive ? "" : " (לא פעיל)"}`,
          menuItem.imageUrl,
          "menu",
          menuItem.imageUrl,
          menuItem.id
        )
      )
    ),
    group(
      "גלריה",
      galleryItems.map((galleryItem) =>
        catalogItem(
          `gallery-${galleryItem.id}`,
          galleryItem.title,
          galleryItem.isActive ? "גלריה באתר" : "גלריה (לא פעיל)",
          galleryItem.imageUrl,
          "gallery",
          galleryItem.imageUrl,
          galleryItem.id
        )
      )
    ),
    group(
      "כתבות",
      pressItems.map((pressItem) =>
        catalogItem(
          `press-${pressItem.id}`,
          pressItem.title,
          pressItem.isActive ? "עמוד כתבות / פרסום" : "כתבות (לא פעיל)",
          pressItem.imageUrl,
          "press",
          pressItem.imageUrl,
          pressItem.id
        )
      )
    )
  ].filter((entry): entry is SiteImageGroup => entry !== null);

  return [...staticGroups, ...dynamicGroups];
}
