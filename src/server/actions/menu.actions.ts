"use server";

import { revalidatePath } from "next/cache";
import { listMenuCategories, listMenuItems, upsertMenuCategory, upsertMenuItem } from "@/services/menu.service";
import type { MenuCategory, MenuItem } from "@/types/content";

export async function getMenuAdminData() {
  const [items, categories] = await Promise.all([listMenuItems(), listMenuCategories()]);
  return { items, categories };
}

export async function saveMenuItemAction(input: MenuItem) {
  const name = input.name.trim();
  if (!name) {
    throw new Error("שם המנה נדרש");
  }
  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("מחיר לא תקין");
  }

  const saved = await upsertMenuItem({
    ...input,
    name,
    description: input.description.trim(),
    imageUrl: input.imageUrl.trim() || "/images/menu/placeholder.svg",
    price,
    isActive: Boolean(input.isActive)
  });

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/");

  return saved;
}

export async function saveMenuCategoryAction(input: MenuCategory) {
  return upsertMenuCategory(input);
}
