import type { MenuItem } from "@/types/content";
import { getMenuItemTranslationFields } from "@/data/menu-item-translation-lookup";
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
  const name = String(item.name ?? "").trim() || "SO WHAT";
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

  const translation = getMenuItemTranslationFields(item, locale);
  const localizedName = translation?.name ?? name;

  return {
    name: localizedName,
    description: translation?.description ?? description,
    longDescription: translation?.longDescription?.trim() || hebrewLong,
    detailNotes: hebrewNotes.map(String),
    imageAlt: resolveMenuItemImageAlt(item, locale, localizedName)
  };
}