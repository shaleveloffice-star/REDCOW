import {
  getMenuCategories,
  getMenuItems,
  saveMenuCategory,
  saveMenuItem
} from "@/repositories/menu.repository";
import type { MenuCategory, MenuItem } from "@/types/content";

const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

export async function listMenuItems(options: { activeOnly?: boolean } = {}): Promise<MenuItem[]> {
  const items = await getMenuItems();
  return items
    .filter((item) => (options.activeOnly ? item.isActive : true))
    .sort(bySortOrder);
}

export async function listMenuCategories(
  options: { activeOnly?: boolean } = {}
): Promise<MenuCategory[]> {
  const categories = await getMenuCategories();
  return categories
    .filter((category) => (options.activeOnly ? category.isActive : true))
    .sort(bySortOrder);
}

export async function getMenuForDisplay() {
  const [items, categories] = await Promise.all([
    listMenuItems({ activeOnly: true }),
    listMenuCategories({ activeOnly: true })
  ]);

  return categories.map((category) => ({
    ...category,
    items: items.filter((item) => item.categoryId === category.id)
  }));
}

export async function upsertMenuItem(input: MenuItem): Promise<MenuItem> {
  return saveMenuItem({ ...input, updatedAt: new Date().toISOString() });
}

export async function upsertMenuCategory(input: MenuCategory): Promise<MenuCategory> {
  return saveMenuCategory({ ...input, updatedAt: new Date().toISOString() });
}
