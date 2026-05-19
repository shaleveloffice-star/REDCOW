import { mockMenuCategories, mockMenuItems } from "@/data/mock/menu.mock";
import type { MenuCategory, MenuItem } from "@/types/content";

let menuItemsCache: MenuItem[] | null = null;

function getMenuItemsMutable(): MenuItem[] {
  if (!menuItemsCache) {
    menuItemsCache = mockMenuItems.map((item) => ({ ...item }));
  }
  return menuItemsCache;
}

export async function getMenuItems(): Promise<MenuItem[]> {
  return getMenuItemsMutable().map((item) => ({ ...item }));
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  return mockMenuCategories.map((category) => ({ ...category }));
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const found = getMenuItemsMutable().find((item) => item.id === id);
  return found ? { ...found } : null;
}

export async function saveMenuItem(input: MenuItem): Promise<MenuItem> {
  const items = getMenuItemsMutable();
  const idx = items.findIndex((i) => i.id === input.id);
  const saved: MenuItem = {
    ...input,
    updatedAt: new Date().toISOString()
  };
  if (idx >= 0) {
    items[idx] = saved;
  } else {
    items.push(saved);
  }
  return { ...saved };
}

export async function saveMenuCategory(input: MenuCategory): Promise<MenuCategory> {
  return input;
}
