import type { MenuItem } from "@/types/content";
import { resolveMenuItemImageAlt } from "@/lib/image-alt";
import {
  resolveMenuItemDisplay,
  type MenuItemWithDisplay
} from "@/lib/translation/menu-display";

import type { Locale } from "./config";

export type LocalizedMenuItem = {
  name: string;
  description: string;
  longDescription: string;
  detailNotes: string[];
  imageAlt: string;
};

export function getLocalizedMenuItem(
  item: MenuItem | MenuItemWithDisplay,
  _locale: Locale
): LocalizedMenuItem {
  if ("displayName" in item && item.displayName) {
    return resolveMenuItemDisplay(item);
  }

  const name = String(item.name ?? "").trim() || "NB BURGER";
  const description = String(item.description ?? "").trim();
  const hebrewNotes = (item.detailNotes ?? []).filter((note) => String(note).trim().length > 0);
  const hebrewLong = String(item.longDescription ?? "").trim();

  return {
    name,
    description,
    longDescription: hebrewLong,
    detailNotes: hebrewNotes.map(String),
    imageAlt: resolveMenuItemImageAlt(item, "he", name)
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
