"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import type { Locale } from "@/i18n/config";
import { revalidatePath, updateTag } from "next/cache";
import { listMenuCategories } from "@/services/menu.service";
import {
  getSeoContentStore,
  getSeoLocaleBundleForAdmin,
  saveSeoLocaleBundleForAdmin
} from "@/services/seo-content.service";
import type { SeoLocaleBundle, SeoPageFieldsInput, SeoPageId } from "@/types/seo-content";

const PUBLIC_PATHS = ["/", "/about", "/menu", "/locations", "/privacy-policy", "/terms"] as const;

function revalidateSeoContentCache() {
  try {
    updateTag(CACHE_TAGS.seoContent);
    PUBLIC_PATHS.forEach((path) => revalidatePath(path));
  } catch {
    // ignore
  }
}

export async function getSeoContentDocumentForAdmin() {
  await requireAdmin();
  return getSeoContentStore();
}

export async function getSeoContentAdminData() {
  await requireAdmin();
  const [document, categories] = await Promise.all([
    getSeoContentStore(),
    listMenuCategories({ activeOnly: false })
  ]);
  return { document, categories };
}

export async function saveCategorySeoFieldsAction(
  locale: Locale,
  categoryId: string,
  fields: SeoPageFieldsInput
) {
  await requireAdmin();
  const { buildCategorySeoMenuPatch } = await import("@/lib/seo-content/admin-category-seo");
  const current = await getSeoLocaleBundleForAdmin(locale);
  const currentMenu = current.pages?.menu;
  const nextMenu = buildCategorySeoMenuPatch(currentMenu, categoryId, fields ?? {});

  return saveSeoPageFieldsAction(locale, "menu", nextMenu);
}

export async function getSeoLocaleAdminBundleAction(locale: Locale) {
  await requireAdmin();
  return getSeoLocaleBundleForAdmin(locale);
}

export async function saveSeoLocaleBundleAction(locale: Locale, bundle: SeoLocaleBundle) {
  await requireAdmin();
  const saved = await saveSeoLocaleBundleForAdmin(locale, bundle);
  revalidateSeoContentCache();
  return saved;
}

export async function saveSeoPageFieldsAction(
  locale: Locale,
  pageId: SeoPageId,
  fields: SeoLocaleBundle["pages"][SeoPageId]
) {
  await requireAdmin();
  const current = await getSeoLocaleBundleForAdmin(locale);
  const next: SeoLocaleBundle = {
    pages: {
      ...(current.pages ?? {}),
      [pageId]: fields ?? {}
    },
    updatedAt: new Date().toISOString()
  };
  const saved = await saveSeoLocaleBundleForAdmin(locale, next);
  revalidateSeoContentCache();
  return saved;
}
