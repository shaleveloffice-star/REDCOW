import type { MenuCategory, MenuItem, MenuItemSauceMode } from "@/types/content";

export const DEFAULT_SAUCE_CHOICE_COUNT = 2;
export const MAX_SAUCE_CHOICE_COUNT = 10;

export function isSauceCategory(category: Pick<MenuCategory, "id" | "slug">): boolean {
  return category.id === "cat-sauces" || category.slug === "sauces";
}

export function normalizeSauceMode(raw: unknown): MenuItemSauceMode {
  return raw === "included" ? "included" : "choice";
}

export function normalizeSauceChoiceCount(raw: unknown): number {
  const value = Math.round(Number(raw));
  if (!Number.isFinite(value) || value < 1) return DEFAULT_SAUCE_CHOICE_COUNT;
  return Math.min(value, MAX_SAUCE_CHOICE_COUNT);
}

export function sauceHeadingText(locale: string, rawMode: unknown, rawCount: unknown): string {
  const mode = normalizeSauceMode(rawMode);
  const count = normalizeSauceChoiceCount(rawCount);
  if (locale === "en") {
    if (mode === "included") return "Sauces & ingredients";
    return count === 1 ? "Sauces & ingredients - choose 1 sauce in this dish." : `Sauces & ingredients - choose up to ${count} sauces in this dish.`;
  }
  if (locale === "fr") {
    if (mode === "included") return "Sauces et ingrédients";
    return count === 1 ? "Sauces et ingrédients - 1 sauce au choix dans ce plat." : `Sauces et ingrédients - jusqu'à ${count} sauces au choix dans ce plat.`;
  }
  if (mode === "included") return "רטבים ומרכיבים";
  return count === 1 ? "רטבים ומרכיבים - ניתן לבחור רוטב 1 בתוך המנה." : `רטבים ומרכיבים - ניתן לבחור עד ${count} רטבים בתוך המנה.`;
}

/** Heading for a dish that lists ingredients but no sauces, where a sauce-choice label would be wrong. */
export function ingredientsOnlyHeadingText(locale: string): string {
  return locale === "en" ? "Ingredients" : locale === "fr" ? "Ingrédients" : "מרכיבי המנה";
}

export function resolveItemSauces(item: MenuItem, items: MenuItem[], categories: MenuCategory[]): MenuItem[] {
  const categoryIds = new Set(categories.filter(c => c.isActive && isSauceCategory(c)).map(c => c.id));
  const available = new Map(items.filter(s => s.isActive && s.id !== item.id && categoryIds.has(s.categoryId)).map(s => [s.id, s]));
  return [...new Set(item.sauceIds ?? [])].flatMap(id => available.has(id) ? [available.get(id)!] : []);
}
