import { mockMenuCategories, mockMenuItems } from "@/data/mock/menu.mock";
import type { MenuCategory, MenuItem } from "@/types/content";

export async function getMenuItems(): Promise<MenuItem[]> {
  return mockMenuItems;
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  return mockMenuCategories;
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  return mockMenuItems.find((item) => item.id === id) ?? null;
}

export async function saveMenuItem(input: MenuItem): Promise<MenuItem> {
  return input;
}

export async function saveMenuCategory(input: MenuCategory): Promise<MenuCategory> {
  return input;
}
