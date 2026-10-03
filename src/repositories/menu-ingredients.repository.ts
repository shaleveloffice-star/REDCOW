import { createFirestoreDocumentStore } from "@/lib/firebase/firestore-store";
import { createJsonSingleDocStore } from "@/lib/admin/json-single-doc-store";
import { normalizeMenuIngredients, sortMenuIngredients } from "@/lib/menu/menu-ingredients";
import type { MenuIngredient, MenuIngredientsDocument } from "@/types/menu-ingredients";

const EMPTY_DOCUMENT: MenuIngredientsDocument = { items: [], updatedAt: "" };

// A siteSettings document is already publicly readable, so no new Firestore rules are needed.
const menuIngredientsStore = createFirestoreDocumentStore<MenuIngredientsDocument>(
  "siteSettings",
  "menu-ingredients",
  createJsonSingleDocStore<MenuIngredientsDocument>("menu-ingredients.json", EMPTY_DOCUMENT)
);

export async function getMenuIngredients(): Promise<MenuIngredient[]> {
  const stored = await menuIngredientsStore.get();
  return sortMenuIngredients(normalizeMenuIngredients(stored.items));
}

export async function saveMenuIngredients(items: MenuIngredient[]): Promise<MenuIngredient[]> {
  const saved = await menuIngredientsStore.save({
    items: sortMenuIngredients(normalizeMenuIngredients(items)),
    updatedAt: new Date().toISOString()
  });
  return saved.items;
}
