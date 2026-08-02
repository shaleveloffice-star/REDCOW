import type { LocalizedMenuItem } from "@/i18n/menu-translations";
import { resolveMenuItemImageAlt } from "@/lib/image-alt";
import type { MenuCategory, MenuItem } from "@/types/content";

export type MenuItemDisplayOverlay = {
  displayName: string;
  displayDescription: string;
  displayLongDescription: string;
  displayDetailNotes: string[];
  displayImageAlt: string;
};

export type MenuCategoryDisplayOverlay = {
  displayName: string;
  displayDescription: string;
};

export type MenuItemWithDisplay = MenuItem & Partial<MenuItemDisplayOverlay>;
export type MenuCategoryWithDisplay = MenuCategory & Partial<MenuCategoryDisplayOverlay>;
export type MenuGroupWithDisplay = MenuCategoryWithDisplay & { items: MenuItemWithDisplay[] };

export function hebrewMenuItemOverlay(item: MenuItem): MenuItemDisplayOverlay {
  const name = String(item.name ?? "").trim() || "NB BURGER";
  const description = String(item.description ?? "").trim();
  const longDescription = String(item.longDescription ?? "").trim();
  const detailNotes = (item.detailNotes ?? []).map(String).filter((note) => note.trim().length > 0);

  return {
    displayName: name,
    displayDescription: description,
    displayLongDescription: longDescription,
    displayDetailNotes: detailNotes,
    displayImageAlt: resolveMenuItemImageAlt(item, "he", name)
  };
}

export function hebrewCategoryOverlay(
  category: Pick<MenuCategory, "name" | "description">
): MenuCategoryDisplayOverlay {
  return {
    displayName: category.name,
    displayDescription: String(category.description ?? "").trim()
  };
}

export function resolveMenuItemDisplay(item: MenuItemWithDisplay): LocalizedMenuItem {
  const overlay = item.displayName
    ? {
        displayName: item.displayName,
        displayDescription: item.displayDescription ?? item.description ?? "",
        displayLongDescription: item.displayLongDescription ?? item.longDescription ?? "",
        displayDetailNotes: item.displayDetailNotes ?? item.detailNotes ?? [],
        displayImageAlt: item.displayImageAlt ?? resolveMenuItemImageAlt(item, "he", item.name)
      }
    : hebrewMenuItemOverlay(item);

  return {
    name: overlay.displayName,
    description: overlay.displayDescription,
    longDescription: overlay.displayLongDescription,
    detailNotes: overlay.displayDetailNotes,
    imageAlt: overlay.displayImageAlt
  };
}

export function resolveCategoryDisplayName(category: { name: string; displayName?: string }): string {
  return category.displayName ?? category.name;
}

export function resolveCategoryDisplayDescription(
  category: { description?: string; displayDescription?: string }
): string {
  return category.displayDescription ?? String(category.description ?? "").trim();
}
