"use server";

import { listMenuCategories, listMenuItems, upsertMenuCategory, upsertMenuItem } from "@/services/menu.service";
import type { MenuCategory, MenuItem } from "@/types/content";

export async function getMenuAdminData() {
  const [items, categories] = await Promise.all([listMenuItems(), listMenuCategories()]);
  return { items, categories };
}

export async function saveMenuItemAction(input: MenuItem) {
  return upsertMenuItem(input);
}

export async function saveMenuCategoryAction(input: MenuCategory) {
  return upsertMenuCategory(input);
}
