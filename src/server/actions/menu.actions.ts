"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { revalidatePath } from "next/cache";
import {
  listMenuCategories,
  listMenuItems,
  removeMenuCategory,
  removeMenuItem,
  upsertMenuCategory,
  upsertMenuItem
} from "@/services/menu.service";
import type { MenuCategory, MenuItem } from "@/types/content";

const menuPaths = ["/admin/menu", "/admin/menu-categories", "/"];

export async function getMenuAdminData() {
  await requireAdmin();
  const [items, categories] = await Promise.all([listMenuItems(), listMenuCategories()]);
  return { items, categories };
}

export async function saveMenuItemAction(input: MenuItem) {
  await requireAdmin();
  const name = input.name.trim();
  if (!name) throw new Error("שם המנה נדרש");
  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) throw new Error("מחיר לא תקין");

  const saved = await upsertMenuItem({
    ...input,
    name,
    description: input.description.trim(),
    imageUrl: input.imageUrl.trim() || "/images/menu/placeholder.svg",
    price,
    isActive: Boolean(input.isActive),
    tags: Array.isArray(input.tags) ? input.tags : []
  });

  menuPaths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deleteMenuItemAction(id: string) {
  await requireAdmin();
  const ok = await removeMenuItem(id);
  if (!ok) throw new Error("המנה לא נמצאה");
  menuPaths.forEach((path) => revalidatePath(path));
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
  return saved;
}

export async function deleteMenuCategoryAction(id: string) {
  await requireAdmin();
  const items = await listMenuItems();
  if (items.some((item) => item.categoryId === id)) {
    throw new Error("לא ניתן למחוק קטגוריה שיש בה מנות. העבר או מחק את המנות קודם.");
  }
  const ok = await removeMenuCategory(id);
  if (!ok) throw new Error("הקטגוריה לא נמצאה");
  menuPaths.forEach((path) => revalidatePath(path));
}
