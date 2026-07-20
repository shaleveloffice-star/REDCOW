"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { materializeMenuImageUrl } from "@/lib/admin/save-menu-image";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import { revalidatePath, updateTag } from "next/cache";
import {
  listMenuCategories,
  listMenuItems,
  removeMenuCategory,
  removeMenuItem,
  upsertMenuCategory,
  upsertMenuItem
} from "@/services/menu.service";
import type { MenuCategory, MenuItem } from "@/types/content";

const menuPaths = ["/admin/menu", "/admin/menu-categories", "/", "/menu"];

function revalidateMenuCache() {
  updateTag(CACHE_TAGS.homepageMenu);
  updateTag(CACHE_TAGS.menuCategories);
  updateTag(CACHE_TAGS.menuDisplay);
}

export type SaveMenuItemResult =
  | { ok: true; item: MenuItem }
  | { ok: false; error: string };

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

  try {
    const name = input.name.trim();
    if (!name) return { ok: false, error: "שם המנה נדרש" };

    const price = Number(input.price);
    if (!Number.isFinite(price) || price < 0) return { ok: false, error: "מחיר לא תקין" };

    const isActive = Boolean(input.isActive);
    if (isActive && price <= 0) {
      return {
        ok: false,
        error: "לא ניתן לפרסם מנה פעילה במחיר 0. יש להגדיר מחיר גדול מ-0 או לבטל את הסימון פעיל."
      };
    }

    const imageUrlRaw = input.imageUrl.trim() || "/images/menu/nb-menu-burger.png";
    let imageUrl: string;
    try {
      imageUrl = assertSafeHttpUrl(imageUrlRaw, "תמונת מנה");
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "תמונת מנה לא תקינה"
      };
    }

    // Persist any temporary data URL as a real file + short URL (admin source of truth).
    const materialized = await materializeMenuImageUrl(imageUrl);
    if (!materialized.ok) {
      return { ok: false, error: materialized.error };
    }
    imageUrl = materialized.url;

    const saved = await upsertMenuItem({
      ...input,
      name,
      description: input.description.trim(),
      imageUrl,
      price,
      isActive,
      tags: Array.isArray(input.tags) ? input.tags : []
    });

    menuPaths.forEach((path) => revalidatePath(path));
    revalidateMenuCache();
    return { ok: true, item: saved };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    console.warn("[saveMenuItemAction]", detail);
    return {
      ok: false,
      error: detail.includes("OneDrive") || detail.includes("דיסק")
        ? detail
        : "שמירת המנה נכשלה. נסו שוב."
    };
  }
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
