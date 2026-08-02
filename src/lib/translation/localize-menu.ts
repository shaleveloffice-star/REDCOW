import "server-only";

import type { Locale } from "@/i18n/config";
import {
  hebrewCategoryOverlay,
  hebrewMenuItemOverlay,
  type MenuCategoryDisplayOverlay,
  type MenuGroupWithDisplay,
  type MenuItemWithDisplay
} from "@/lib/translation/menu-display";
import { translateTextsForLocale } from "@/lib/translation/translate-texts";
import type { MenuCategory, MenuItem } from "@/types/content";

export type {
  MenuCategoryDisplayOverlay,
  MenuCategoryWithDisplay,
  MenuGroupWithDisplay,
  MenuItemDisplayOverlay,
  MenuItemWithDisplay
} from "@/lib/translation/menu-display";

async function translateStringMap(strings: string[], locale: Locale): Promise<Map<string, string>> {
  const unique = [...new Set(strings.filter((entry) => entry.trim()))];
  if (unique.length === 0) {
    return new Map();
  }

  try {
    const translated = await translateTextsForLocale(unique, locale);
    return new Map(unique.map((source, index) => [source, translated[index] ?? source]));
  } catch (error) {
    console.error("[translation] Failed to localize menu strings", error);
    return new Map(unique.map((source) => [source, source]));
  }
}

export async function localizeMenuItem(item: MenuItem, locale: Locale): Promise<MenuItemWithDisplay> {
  const overlay = hebrewMenuItemOverlay(item);
  if (locale === "he") {
    return { ...item, ...overlay };
  }

  const strings = [
    overlay.displayName,
    overlay.displayDescription,
    overlay.displayLongDescription,
    ...overlay.displayDetailNotes
  ];
  const translated = await translateStringMap(strings, locale);
  const map = (source: string) => translated.get(source) ?? source;

  return {
    ...item,
    displayName: map(overlay.displayName),
    displayDescription: map(overlay.displayDescription),
    displayLongDescription: map(overlay.displayLongDescription),
    displayDetailNotes: overlay.displayDetailNotes.map(map),
    displayImageAlt: map(overlay.displayImageAlt)
  };
}

export async function localizeMenuItems(items: MenuItem[], locale: Locale): Promise<MenuItemWithDisplay[]> {
  if (locale === "he") {
    return items.map((item) => ({ ...item, ...hebrewMenuItemOverlay(item) }));
  }

  const overlays = items.map((item) => hebrewMenuItemOverlay(item));
  const strings = overlays.flatMap((overlay) => [
    overlay.displayName,
    overlay.displayDescription,
    overlay.displayLongDescription,
    ...overlay.displayDetailNotes,
    overlay.displayImageAlt
  ]);
  const translated = await translateStringMap(strings, locale);
  const map = (source: string) => translated.get(source) ?? source;

  return items.map((item, index) => {
    const overlay = overlays[index];
    return {
      ...item,
      displayName: map(overlay.displayName),
      displayDescription: map(overlay.displayDescription),
      displayLongDescription: map(overlay.displayLongDescription),
      displayDetailNotes: overlay.displayDetailNotes.map(map),
      displayImageAlt: map(overlay.displayImageAlt)
    };
  });
}

export async function localizeMenuGroups(
  groups: Array<MenuCategory & { items: MenuItem[] }>,
  locale: Locale
): Promise<MenuGroupWithDisplay[]> {
  if (locale === "he") {
    return groups.map((group) => ({
      ...group,
      ...hebrewCategoryOverlay(group),
      items: group.items.map((item) => ({ ...item, ...hebrewMenuItemOverlay(item) }))
    }));
  }

  const categoryOverlays = groups.map((group) => hebrewCategoryOverlay(group));
  const itemOverlays = groups.flatMap((group) => group.items.map((item) => hebrewMenuItemOverlay(item)));
  const strings = [
    ...categoryOverlays.flatMap((overlay) => [overlay.displayName, overlay.displayDescription]),
    ...itemOverlays.flatMap((overlay) => [
      overlay.displayName,
      overlay.displayDescription,
      overlay.displayLongDescription,
      ...overlay.displayDetailNotes,
      overlay.displayImageAlt
    ])
  ];
  const translated = await translateStringMap(strings, locale);
  const map = (source: string) => translated.get(source) ?? source;

  let itemOverlayIndex = 0;
  return groups.map((group, groupIndex) => {
    const categoryOverlay = categoryOverlays[groupIndex];
    const items = group.items.map((item) => {
      const overlay = itemOverlays[itemOverlayIndex];
      itemOverlayIndex += 1;
      return {
        ...item,
        displayName: map(overlay.displayName),
        displayDescription: map(overlay.displayDescription),
        displayLongDescription: map(overlay.displayLongDescription),
        displayDetailNotes: overlay.displayDetailNotes.map(map),
        displayImageAlt: map(overlay.displayImageAlt)
      };
    });

    return {
      ...group,
      displayName: map(categoryOverlay.displayName),
      displayDescription: map(categoryOverlay.displayDescription),
      items
    };
  });
}

export async function localizeCategory<T extends Pick<MenuCategory, "id" | "name" | "description" | "slug">>(
  category: T,
  locale: Locale
): Promise<T & MenuCategoryDisplayOverlay> {
  const overlay = hebrewCategoryOverlay(category);
  if (locale === "he") {
    return { ...category, ...overlay };
  }

  const translated = await translateStringMap(
    [overlay.displayName, overlay.displayDescription],
    locale
  );
  const map = (source: string) => translated.get(source) ?? source;

  return {
    ...category,
    displayName: map(overlay.displayName),
    displayDescription: map(overlay.displayDescription)
  };
}
