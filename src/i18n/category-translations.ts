import type { Locale } from "@/i18n/config";

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
  category: { id: string; name: string; slug?: string },
  locale: Locale
): string {
  if (locale === "he") {
    return category.name;
  }

  return CATEGORY_TRANSLATIONS[category.id]?.[locale] ?? category.name;
}
