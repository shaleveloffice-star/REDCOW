import type { MenuItem } from "@/types/content";
import { MENU_ITEM_TRANSLATIONS } from "@/data/menu-item-translations";
import { resolveMenuItemImageAlt } from "@/lib/image-alt";

import type { Locale } from "./config";

export type LocalizedMenuItem = {
  name: string;
  description: string;
  longDescription: string;
  detailNotes: string[];
  imageAlt: string;
};

export function getLocalizedMenuItem(item: MenuItem, locale: Locale): LocalizedMenuItem {
  const hebrewNotes = (item.detailNotes ?? []).filter((note) => String(note).trim().length > 0);
  const hebrewLong = String(item.longDescription ?? "").trim();
  const name = String(item.name ?? "").trim() || "NB BURGER";
  const description = String(item.description ?? "").trim();

  if (locale === "he") {
    return {
      name,
      description,
      longDescription: hebrewLong,
      detailNotes: hebrewNotes.map(String),
      imageAlt: resolveMenuItemImageAlt(item, locale, name)
    };
  }

  const translation = MENU_ITEM_TRANSLATIONS[item.id]?.[locale];
  const localizedName = translation?.name ?? name;

  return {
    name: localizedName,
    description: translation?.description ?? description,
    longDescription: translation?.longDescription?.trim() || hebrewLong,
    detailNotes: hebrewNotes.map(String),
    imageAlt: resolveMenuItemImageAlt(item, locale, localizedName)
  };
}

/** Close-up image for the product detail page (falls back to legacy galleryUrls). */
export function getMenuItemCloseUpImageUrl(item: MenuItem): string | undefined {
  const closeUp = String(item.closeUpImageUrl ?? "").trim();
  if (closeUp) {
    return closeUp;
  }

  const primary = String(item.imageUrl ?? "").trim();
  const legacy = (item.galleryUrls ?? [])
    .map((url) => url.trim())
    .filter(Boolean)
    .find((url) => url !== primary);

  return legacy;
}

/** Unique non-empty gallery URLs for optional product galleries. */
export function getMenuItemGalleryUrls(item: MenuItem): string[] {
  const raw = [item.imageUrl, item.closeUpImageUrl, ...(item.galleryUrls ?? [])]
    .map((url) => String(url ?? "").trim())
    .filter(Boolean);
  return [...new Set(raw)];
}
