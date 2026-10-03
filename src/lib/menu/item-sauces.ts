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
    return mode === "included" ? "Sauces in this dish" : `Choice of ${count} sauce${count === 1 ? "" : "s"} included`;
  }
  if (locale === "fr") {
    if (mode === "included") return "Sauces dans ce plat";
    return count === 1 ? "1 sauce au choix incluse" : `${count} sauces au choix incluses`;
  }
  if (mode === "included") return "הרטבים בתוך המנה";
  return count === 1 ? "רוטב 1 לבחירה בתוך המנה" : `${count} רטבים לבחירה בתוך המנה`;
}

export function resolveItemSauces(item: MenuItem, items: MenuItem[], categories: MenuCategory[]): MenuItem[] {
  const categoryIds = new Set(categories.filter(c => c.isActive && isSauceCategory(c)).map(c => c.id));
  const available = new Map(items.filter(s => s.isActive && s.id !== item.id && categoryIds.has(s.categoryId)).map(s => [s.id, s]));
  return [...new Set(item.sauceIds ?? [])].flatMap(id => available.has(id) ? [available.get(id)!] : []);
}
