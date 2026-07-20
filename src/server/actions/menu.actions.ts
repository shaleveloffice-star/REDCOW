"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { saveMenuItemCore } from "@/lib/admin/save-menu-item";
import type { SaveMenuItemResult } from "@/lib/admin/save-menu-item";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { revalidatePath, updateTag } from "next/cache";
import {
  listMenuCategories,
  listMenuItems,
  removeMenuCategory,
  removeMenuItem,
  upsertMenuCategory
} from "@/services/menu.service";
import type { MenuCategory, MenuItem } from "@/types/content";

const menuPaths = ["/admin/menu", "/admin/menu-categories", "/", "/menu"];

function revalidateMenuCache() {
  try {
    updateTag(CACHE_TAGS.homepageMenu);
    updateTag(CACHE_TAGS.menuCategories);
    updateTag(CACHE_TAGS.menuDisplay);
  } catch {
    // ignore cache errors — data already saved
  }
}

export async function getMenuAdminData() {
  await requireAdmin();
  const [items, categories] = await Promise.all([listMenuItems(), listMenuCategories()]);
  return { items, categories };
}

export async function saveMenuItemAction(input: MenuItem): Promise<SaveMenuItemResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "אין הרשאת אדמין. התחברו מחדש ל־/admin/login" };
  }

  return saveMenuItemCore(input);
}

export async function deleteMenuItemAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const ok = await removeMenuItem(id);
  if (!ok) throw new Error("המנה לא נמצאה");
  menuPaths.forEach((path) => revalidatePath(path));
  revalidateMenuCache();
}

export async function saveMenuCategoryAction(input: MenuCategory) {
  await requireAdmin();
  const name = input.name.trim();
  const slug = input.slug.trim();
  if (!name) throw new Error("שם הקטגוריה נדרש");
  if (!slug) throw new Error("Slug נדרש");

  const saved = await upsertMenuCategory({
    ...input,
    name,
    slug,
    description: input.description?.trim() ?? "",
    isActive: Boolean(input.isActive)
  });

  menuPaths.forEach((path) => revalidatePath(path));
  revalidateMenuCache();
  return saved;
}

export async function deleteMenuCategoryAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const items = await listMenuItems();
  if (items.some((item) => item.categoryId === id)) {
    throw new Error("לא ניתן למחוק קטגוריה שיש בה מנות. העבר או מחק את המנות קודם.");
  }
  const ok = await removeMenuCategory(id);
  if (!ok) throw new Error("הקטגוריה לא נמצאה");
  menuPaths.forEach((path) => revalidatePath(path));
  revalidateMenuCache();
}
