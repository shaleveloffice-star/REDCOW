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
import type { SeoPageFieldsInput } from "@/types/seo-content";
import { mutateMenuRecords } from "@/repositories/menu-transaction";
import { ensureUniqueProductSlug, resolveMenuItemSlug, getMenuItemSlugAliases } from "@/lib/menu/product-slug";
import { resolveCategorySlug, getCategorySlugAliases } from "@/lib/menu/category-slug";
import { buildCategorySeoMenuPatch } from "@/lib/seo-content/admin-category-seo";
import { sanitizeSeoLocaleBundle } from "@/lib/seo-content/sanitize-seo-storage";

const MENU_ITEM_DELETABLE_FIELDS = [
  "longDescription",
  "imageAlt",
  "primaryKeyword",
  "metaTitle",
  "metaDescription",
  "galleryUrls",
  "detailNotes"
] as const;

const menuItemsStore = createFirestoreCollectionStore("menuItems", localMenuItemsStore, {
  access: "public",
  seed: mockMenuItems,
  deletableFields: MENU_ITEM_DELETABLE_FIELDS
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
  return mutateMenuRecords(({ items, categories }) => {
    if (!categories.some(category => category.id === normalized.categoryId)) throw new Error("קטגוריית המנה אינה קיימת");
    const current = items.find(item => item.id === input.id);
    const slug = ensureUniqueProductSlug(resolveMenuItemSlug(normalized), categories.flatMap(getCategorySlugAliases), { currentId: input.id, items });
    const saved = { ...current, ...normalized, slug, previousSlugs: [...new Set([...(current?.previousSlugs ?? []), ...(current ? [resolveMenuItemSlug(current)] : [])])].filter(value => value !== slug) };
    for (const field of MENU_ITEM_DELETABLE_FIELDS) if (!(field in normalized)) delete saved[field];
    return { result: saved, item: saved };
  });
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  return mutateMenuRecords(({ items }) => ({ result: items.some(item => item.id === id), deleteItem: id }));
}

export async function saveMenuCategory(input: MenuCategory, seoFields?: SeoPageFieldsInput): Promise<MenuCategory> {
  const normalized = normalizeMenuCategory(input);
  return mutateMenuRecords(({ items, categories, seo }) => {
    const slug = normalized.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Slug לא תקין - השתמשו באנגלית, מספרים ומקפים");
    const taken = [...items.flatMap(getMenuItemSlugAliases), ...categories.filter(category => category.id !== input.id).flatMap(getCategorySlugAliases)];
    if (taken.includes(slug)) throw new Error("Slug כבר משמש מנה או קטגוריה אחרת");
    const current = categories.find(category => category.id === input.id);
    const saved = { ...current, ...normalized, slug, previousSlugs: [...new Set([...(current?.previousSlugs ?? []), ...(current ? [resolveCategorySlug(current)] : [])])].filter(value => value !== slug) };
    const nextSeo = seoFields ? sanitizeSeoLocaleBundle({ ...seo, pages: { ...seo.pages, menu: buildCategorySeoMenuPatch(seo.pages?.menu, input.id, seoFields) }, updatedAt: new Date().toISOString() }) : undefined;
    return { result: saved, category: saved, seo: nextSeo };
  });
}

export async function deleteMenuCategory(id: string): Promise<boolean> {
  return mutateMenuRecords(({ items, categories, seo }) => {
    if (items.some(item => item.categoryId === id)) throw new Error("לא ניתן למחוק קטגוריה שיש בה מנות");
    if (!categories.some(category => category.id === id)) return { result: false };
    const menu = seo.pages?.menu;
    const categoryPages = { ...menu?.categoryPages }, categoryIntros = { ...menu?.categoryIntros };
    delete categoryPages[id]; delete categoryIntros[id];
    return { result: true, deleteCategory: id, seo: sanitizeSeoLocaleBundle({ ...seo, pages: { ...seo.pages, menu: { ...menu, categoryPages, categoryIntros } }, updatedAt: new Date().toISOString() }) };
  });
}
