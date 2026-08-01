import { slugifyProductName } from "@/lib/menu/product-slug";
import type { MenuCategory, MenuItem } from "@/types/content";

import type { MenuItemSmartPasteApplyResult, MenuItemSmartPastePreview } from "./types";

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function resolveCategoryId(categories: MenuCategory[], raw: string): string | undefined {
  const needle = raw.trim().toLowerCase();
  if (!needle) return undefined;

  const byName = categories.find((entry) => entry.name.trim().toLowerCase() === needle);
  if (byName) return byName.id;

  const bySlug = categories.find((entry) => entry.slug.trim().toLowerCase() === needle);
  if (bySlug) return bySlug.id;

  const partial = categories.find(
    (entry) =>
      entry.name.trim().toLowerCase().includes(needle) ||
      needle.includes(entry.name.trim().toLowerCase())
  );
  return partial?.id;
}

export function wouldOverwriteMenuItemContent(
  preview: MenuItemSmartPastePreview,
  draft: MenuItem
): boolean {
  const parsed = preview.data;

  if (parsed.name && hasText(draft.name)) return true;
  if (parsed.category && hasText(draft.categoryId)) return true;
  if (parsed.price !== undefined && draft.price > 0) return true;
  if (parsed.description && hasText(draft.description)) return true;
  if (parsed.longDescription && hasText(draft.longDescription)) return true;
  if (parsed.imageAlt && hasText(draft.imageAlt)) return true;
  if (parsed.primaryKeyword && hasText(draft.primaryKeyword)) return true;
  if (parsed.metaTitle && hasText(draft.metaTitle)) return true;
  if (parsed.metaDescription && hasText(draft.metaDescription)) return true;
  if (parsed.slug && hasText(draft.slug)) return true;
  if (parsed.sortOrder !== undefined && draft.sortOrder > 0) return true;
  if (parsed.tags && parsed.tags.length > 0 && (draft.tags?.length ?? 0) > 0) return true;

  return false;
}

export function applyMenuItemSmartPaste(
  preview: MenuItemSmartPastePreview,
  draft: MenuItem,
  categories: MenuCategory[]
): MenuItemSmartPasteApplyResult {
  const parsed = preview.data;
  const nextDraft: MenuItem = { ...draft, tags: [...(draft.tags ?? [])] };
  const warnings: string[] = [];
  let slugTouched = false;

  if (parsed.name) {
    nextDraft.name = parsed.name.trim();
    if (!parsed.slug) {
      nextDraft.slug = slugifyProductName(parsed.name) || nextDraft.slug;
    }
  }

  if (parsed.category) {
    const categoryId = resolveCategoryId(categories, parsed.category);
    if (categoryId) {
      nextDraft.categoryId = categoryId;
    } else {
      warnings.push(`קטגוריה "${parsed.category}" לא זוהתה — יש לבחור ידנית.`);
    }
  }

  if (parsed.price !== undefined) nextDraft.price = parsed.price;
  if (parsed.description) nextDraft.description = parsed.description;
  if (parsed.longDescription) nextDraft.longDescription = parsed.longDescription;
  if (parsed.imageAlt) nextDraft.imageAlt = parsed.imageAlt;
  if (parsed.primaryKeyword) nextDraft.primaryKeyword = parsed.primaryKeyword;
  if (parsed.metaTitle) nextDraft.metaTitle = parsed.metaTitle;
  if (parsed.metaDescription) nextDraft.metaDescription = parsed.metaDescription;

  if (parsed.slug) {
    nextDraft.slug = parsed.slug.trim();
    slugTouched = true;
  }

  if (parsed.sortOrder !== undefined) nextDraft.sortOrder = parsed.sortOrder;
  if (parsed.tags && parsed.tags.length > 0) nextDraft.tags = parsed.tags;

  return { draft: nextDraft, slugTouched, warnings };
}
