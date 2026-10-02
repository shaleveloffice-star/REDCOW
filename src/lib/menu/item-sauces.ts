import type { MenuCategory, MenuItem } from "@/types/content";

export function isSauceCategory(category: Pick<MenuCategory, "id" | "slug">): boolean {
  return category.id === "cat-sauces" || category.slug === "sauces";
}

export function resolveItemSauces(item: MenuItem, items: MenuItem[], categories: MenuCategory[]): MenuItem[] {
  const categoryIds = new Set(categories.filter(c => c.isActive && isSauceCategory(c)).map(c => c.id));
  const available = new Map(items.filter(s => s.isActive && s.id !== item.id && categoryIds.has(s.categoryId)).map(s => [s.id, s]));
  return [...new Set(item.sauceIds ?? [])].flatMap(id => available.has(id) ? [available.get(id)!] : []);
}
