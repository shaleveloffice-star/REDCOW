"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { buildCategorySeoMenuPatch } from "@/lib/seo-content/admin-category-seo";
import {
  mergeSeoPageFields,
  sanitizeSeoLocaleBundle,
  sanitizeSeoPageFields
} from "@/lib/seo-content/sanitize-seo-storage";
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

export type SeoSaveResult = {
  ok: true;
  updatedAt: string;
};

function revalidateSeoContentCache() {
  try {
    updateTag(CACHE_TAGS.seoContent);
    PUBLIC_PATHS.forEach((path) => revalidatePath(path));
  } catch {
    // ignore cache revalidation failures
  }
}

async function persistSeoPageFields(
  locale: Locale,
  pageId: SeoPageId,
  fields: SeoPageFieldsInput
): Promise<SeoSaveResult> {
  const current = await getSeoLocaleBundleForAdmin(locale);
  const mergedFields = mergeSeoPageFields(current.pages?.[pageId], fields);
  const next: SeoLocaleBundle = sanitizeSeoLocaleBundle({
    pages: {
      ...(current.pages ?? {}),
      [pageId]: mergedFields
    },
    updatedAt: new Date().toISOString()
  });

  await saveSeoLocaleBundleForAdmin(locale, next);
  revalidateSeoContentCache();

  return { ok: true, updatedAt: next.updatedAt };
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
): Promise<SeoSaveResult> {
  await requireAdmin();
  const current = await getSeoLocaleBundleForAdmin(locale);
  const nextMenu = buildCategorySeoMenuPatch(current.pages?.menu, categoryId, sanitizeSeoPageFields(fields));
  return persistSeoPageFields(locale, "menu", nextMenu);
}

export async function getSeoLocaleAdminBundleAction(locale: Locale) {
  await requireAdmin();
  return getSeoLocaleBundleForAdmin(locale);
}

export async function saveSeoLocaleBundleAction(locale: Locale, bundle: SeoLocaleBundle): Promise<SeoSaveResult> {
  await requireAdmin();
  const saved = sanitizeSeoLocaleBundle({
    ...bundle,
    updatedAt: new Date().toISOString()
  });
  await saveSeoLocaleBundleForAdmin(locale, saved);
  revalidateSeoContentCache();
  return { ok: true, updatedAt: saved.updatedAt };
}

export async function saveSeoPageFieldsAction(
  locale: Locale,
  pageId: SeoPageId,
  fields: SeoPageFieldsInput
): Promise<SeoSaveResult> {
  await requireAdmin();
  return persistSeoPageFields(locale, pageId, sanitizeSeoPageFields(fields ?? {}));
}
