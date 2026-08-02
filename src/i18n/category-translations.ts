import type { Locale } from "@/i18n/config";
import {
  resolveCategoryDisplayDescription,
  resolveCategoryDisplayName,
  type MenuCategoryWithDisplay
} from "@/lib/translation/localize-menu";

/** Legacy static translations kept for backward compatibility; public site uses auto-translation. */
const CATEGORY_TRANSLATIONS: Record<string, Partial<Record<Locale, string>>> = {
  "cat-burgers": { en: "Burgers", fr: "Burgers" },
  "cat-meals": { en: "Meals", fr: "Formules" },
  "cat-sides": { en: "Sides", fr: "Accompagnements" },
  "cat-salads": { en: "Salads", fr: "Salades" },
  "cat-sauces": { en: "Sauces", fr: "Sauces" },
  "cat-soft-drinks": { en: "Soft Drinks", fr: "Boissons" },
  "cat-beers": { en: "Beers", fr: "Bières" }
};

export function getLocalizedCategoryName(
  category: MenuCategoryWithDisplay | { id: string; name: string; slug?: string },
  _locale: Locale
): string {
  if ("displayName" in category && category.displayName) {
    return resolveCategoryDisplayName(category);
  }

  return category.name;
}

export function getLocalizedCategoryDescription(
  category: MenuCategoryWithDisplay | { description?: string },
  _locale: Locale
): string {
  if ("displayDescription" in category && category.displayDescription) {
    return resolveCategoryDisplayDescription(category);
  }

  return String(category.description ?? "").trim();
}

/** @deprecated Legacy static map — retained for compatibility only. */
export function getLegacyCategoryTranslation(categoryId: string, locale: Locale): string | undefined {
  return CATEGORY_TRANSLATIONS[categoryId]?.[locale];
}
