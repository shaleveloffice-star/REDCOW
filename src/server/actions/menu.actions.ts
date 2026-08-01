"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { saveMenuItemCore } from "@/lib/admin/save-menu-item";
import type { SaveMenuItemResult } from "@/lib/admin/save-menu-item";
import { pickCategorySeoFields } from "@/lib/seo-content/admin-category-seo";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import type { Locale } from "@/i18n/config";
import { revalidatePath, updateTag } from "next/cache";
import { saveAllCategorySeoFieldsForAdmin, removeCategorySeoForAdmin } from "@/services/seo-content.service";
import {
  getHomepageMenuShowcaseSelection,
  listMenuCategories,
  listMenuItems,
  removeMenuCategory,
  removeMenuItem,
  updateHomepageMenuShowcase,
  upsertMenuCategory
} from "@/services/menu.service";
import type { MenuCategory, MenuItem } from "@/types/content";
import type { SeoPageFieldsInput } from "@/types/seo-content";

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
  const [items, categories, homepageShowcase] = await Promise.all([
    listMenuItems(),
    listMenuCategories(),
    getHomepageMenuShowcaseSelection()
  ]);
  return { items, categories, homepageShowcase };
}

export async function saveHomepageMenuShowcaseAction(itemIds: string[]) {
  await requireAdmin();
  const cleaned = itemIds.filter((id) => typeof id === "string" && id.trim().length > 0);
  if (cleaned.length === 0) {
    throw new Error("יש לבחור לפחות מנה אחת לדף הבית.");
  }
  await updateHomepageMenuShowcase(cleaned);
  menuPaths.forEach((path) => revalidatePath(path));
  revalidateMenuCache();
  return cleaned;
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

export async function saveMenuCategoryWithSeoAction(
  input: MenuCategory,
  seoByLocale: Partial<Record<Locale, SeoPageFieldsInput>>
) {
  try {
    await requireAdmin();
  } catch {
    throw new Error("אין הרשאת אדמין. התחברו מחדש ל־/admin/login");
  }

  const name = input.name.trim();
  const slug = input.slug.trim();
  if (!name) throw new Error("שם הקטגוריה נדרש");
  if (!slug) throw new Error("Slug נדרש");

  const sanitizedSeo = Object.fromEntries(
    Object.entries(seoByLocale)
      .filter((entry): entry is [Locale, SeoPageFieldsInput] => Boolean(entry[1]))
      .map(([locale, fields]) => [locale, pickCategorySeoFields(fields)])
  ) as Partial<Record<Locale, SeoPageFieldsInput>>;

  try {
    await saveAllCategorySeoFieldsForAdmin(input.id.trim(), sanitizedSeo);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "שמירת תוכן SEO נכשלה";
    throw new Error(/[\u0590-\u05FF]/.test(detail) ? detail : "שמירת תוכן SEO לקטגוריה נכשלה.");
  }

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
  await removeCategorySeoForAdmin(id);
  menuPaths.forEach((path) => revalidatePath(path));
  revalidateMenuCache();
}
