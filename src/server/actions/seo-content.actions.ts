"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import {
  buildCategorySeoMenuPatch,
  pickCategorySeoFields
} from "@/lib/seo-content/admin-category-seo";
import { sanitizeSeoLocaleBundle, sanitizeSeoPageFields } from "@/lib/seo-content/sanitize-seo-storage";
import { revalidateSeoContentCache } from "@/lib/seo-content/revalidate-seo-cache";
import type { Locale } from "@/i18n/config";
import { listMenuCategories } from "@/services/menu.service";
import {
  getSeoContentStore,
  getSeoLocaleBundleForAdmin,
  persistSeoPageFieldsForAdmin,
  saveAllCategorySeoFieldsForAdmin,
  saveSeoLocaleBundleForAdmin
} from "@/services/seo-content.service";
import type { SeoLocaleBundle, SeoPageFieldsInput, SeoPageId } from "@/types/seo-content";

export type SeoSaveResult = {
  ok: true;
  updatedAt: string;
};

function seoActionError(error: unknown, fallback: string): Error {
  const detail = error instanceof Error ? error.message : fallback;
  if (/[\u0590-\u05FF]/.test(detail)) {
    return new Error(detail);
  }
  console.error("[seo-content]", detail);
  return new Error(fallback);
}

async function requireAdminOrThrow() {
  try {
    await requireAdmin();
  } catch {
    throw new Error("אין הרשאת אדמין. התחברו מחדש ל־/admin/login");
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
): Promise<SeoSaveResult> {
  await requireAdminOrThrow();

  try {
    const current = await getSeoLocaleBundleForAdmin(locale);
    const nextMenu = buildCategorySeoMenuPatch(
      current.pages?.menu,
      categoryId,
      pickCategorySeoFields(fields)
    );
    const result = await persistSeoPageFieldsForAdmin(locale, "menu", nextMenu);
    return { ok: true, updatedAt: result.updatedAt };
  } catch (error) {
    throw seoActionError(error, "שמירת תוכן SEO לקטגוריה נכשלה.");
  }
}

/** Saves Hebrew category SEO in one server round-trip. */
export async function saveAllCategorySeoFieldsAction(
  categoryId: string,
  seoFields: SeoPageFieldsInput
): Promise<SeoSaveResult> {
  await requireAdminOrThrow();

  try {
    const result = await saveAllCategorySeoFieldsForAdmin(categoryId, seoFields);
    return { ok: true, updatedAt: result.updatedAt };
  } catch (error) {
    throw seoActionError(error, "שמירת תוכן SEO לקטגוריה נכשלה.");
  }
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
  await requireAdminOrThrow();

  try {
    const result = await persistSeoPageFieldsForAdmin(locale, pageId, sanitizeSeoPageFields(fields ?? {}));
    return { ok: true, updatedAt: result.updatedAt };
  } catch (error) {
    throw seoActionError(error, "שמירת תוכן SEO נכשלה.");
  }
}
