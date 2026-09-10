import { createFirestoreDocumentStore } from "@/lib/firebase/firestore-store";
import { createJsonSingleDocStore } from "@/lib/admin/json-single-doc-store";
import { DEFAULT_MENU_HERO, validateMenuHeroInput } from "@/lib/menu/menu-hero-config";
import type { MenuHeroConfig, MenuHeroInput } from "@/types/menu-hero";

// A separate document keeps these controls independent of homepage/settings saves.
const menuHeroStore = createFirestoreDocumentStore<MenuHeroConfig>(
  "siteSettings",
  "menu-hero",
  createJsonSingleDocStore<MenuHeroConfig>("menu-hero.json", DEFAULT_MENU_HERO)
);

export async function getMenuHeroConfig(): Promise<MenuHeroConfig> {
  const stored = await menuHeroStore.get();
  return {
    ...validateMenuHeroInput({ ...DEFAULT_MENU_HERO, ...stored }),
    updatedAt: typeof stored.updatedAt === "string" ? stored.updatedAt : DEFAULT_MENU_HERO.updatedAt
  };
}

export async function saveMenuHeroConfig(input: MenuHeroInput): Promise<MenuHeroConfig> {
  return menuHeroStore.save({
    ...validateMenuHeroInput(input),
    updatedAt: new Date().toISOString()
  });
}
