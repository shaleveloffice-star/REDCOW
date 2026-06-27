import { mockMenuCategories, mockMenuItems } from "@/data/mock/menu.mock";
import {
  createFirestoreCollectionStore
} from "@/lib/firebase/firestore-store";
import {
  localMenuCategoriesStore,
  localMenuItemsStore
} from "@/lib/firebase/local-stores";
import type { MenuCategory, MenuItem } from "@/types/content";

const menuItemsStore = createFirestoreCollectionStore(
  "menuItems",
  localMenuItemsStore,
  mockMenuItems
);
const menuCategoriesStore = createFirestoreCollectionStore(
  "menuCategories",
  localMenuCategoriesStore,
  mockMenuCategories
);

export async function getMenuItems(): Promise<MenuItem[]> {
  return menuItemsStore.getAll();
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  return menuCategoriesStore.getAll();
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  return menuItemsStore.getById(id);
}

export async function saveMenuItem(input: MenuItem): Promise<MenuItem> {
  return menuItemsStore.save(input);
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  return menuItemsStore.remove(id);
}

export async function saveMenuCategory(input: MenuCategory): Promise<MenuCategory> {
  return menuCategoriesStore.save(input);
}

export async function deleteMenuCategory(id: string): Promise<boolean> {
  return menuCategoriesStore.remove(id);
}
