import { mockMenuCategories, mockMenuItems } from "@/data/mock/menu.mock";
import {
  createFirestoreCollectionStore
} from "@/lib/firebase/firestore-store";
import {
  localMenuCategoriesStore,
  localMenuItemsStore
} from "@/lib/firebase/local-stores";
import { normalizeMenuCategory, normalizeMenuItem } from "@/lib/menu/normalize-menu";
import type { MenuCategory, MenuItem } from "@/types/content";

const menuItemsStore = createFirestoreCollectionStore("menuItems", localMenuItemsStore, {
  access: "public",
  seed: mockMenuItems
});
const menuCategoriesStore = createFirestoreCollectionStore(
  "menuCategories",
  localMenuCategoriesStore,
  {
    access: "public",
    seed: mockMenuCategories
  }
);

export async function getMenuItems(): Promise<MenuItem[]> {
  const items = await menuItemsStore.getAll();
  return items.map((item) => normalizeMenuItem(item));
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const categories = await menuCategoriesStore.getAll();
  return categories.map((category) => normalizeMenuCategory(category));
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const item = await menuItemsStore.getById(id);
  return item ? normalizeMenuItem(item) : null;
}

export async function saveMenuItem(input: MenuItem): Promise<MenuItem> {
  const normalized = normalizeMenuItem(input);
  return menuItemsStore.save(normalized);
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  return menuItemsStore.remove(id);
}

export async function saveMenuCategory(input: MenuCategory): Promise<MenuCategory> {
  const normalized = normalizeMenuCategory(input);
  return menuCategoriesStore.save(normalized);
}

export async function deleteMenuCategory(id: string): Promise<boolean> {
  return menuCategoriesStore.remove(id);
}
