import type { Locale } from "@/i18n/config";
import {
  buildCategorySeoMenuPatch,
  getStoredCategorySeoFields,
  pickCategorySeoFields
} from "@/lib/seo-content/admin-category-seo";
import { resolveSeoPageContent } from "@/lib/seo-content/resolve-seo-content";
import { applySeoIntentOverrides } from "@/data/seo-intent-map";
import {
  mergeSeoPageFields,
  sanitizeSeoLocaleBundle,
  sanitizeSeoPageFields
} from "@/lib/seo-content/sanitize-seo-storage";
import { revalidateSeoContentCache } from "@/lib/seo-content/revalidate-seo-cache";
import {
  getSeoContentDocument,
  saveSeoLocaleBundle
} from "@/repositories/seo-content.repository";
import type {
  ResolvedSeoPageContent,
  SeoContentDocument,
  SeoLocaleBundle,
  SeoPageFieldsInput,
  SeoPageId
} from "@/types/seo-content";

export async function getSeoContentStore(): Promise<SeoContentDocument> {
  return getSeoContentDocument();
}

export async function getStoredSeoPageFields(
  locale: Locale,
  pageId: SeoPageId
): Promise<SeoPageFieldsInput | undefined> {
  const document = await getSeoContentDocument();
  return document[locale]?.pages?.[pageId];
}

export async function getResolvedSeoPageContent(
  locale: Locale,
  pageId: SeoPageId
): Promise<ResolvedSeoPageContent> {
  const stored = await getStoredSeoPageFields(locale, pageId);
  return applySeoIntentOverrides(locale, pageId, resolveSeoPageContent(locale, pageId, stored));
}

export async function saveSeoPageFields(
  locale: Locale,
  pageId: SeoPageId,
  fields: SeoPageFieldsInput
): Promise<SeoLocaleBundle> {
  const document = await getSeoContentDocument();
  const current = document[locale] ?? { pages: {}, updatedAt: new Date(0).toISOString() };

  const next: SeoLocaleBundle = {
    pages: {
      ...(current.pages ?? {}),
      [pageId]: fields
    },
    updatedAt: new Date().toISOString()
  };

  return saveSeoLocaleBundle(locale, next);
}

export async function getSeoLocaleBundleForAdmin(locale: Locale): Promise<SeoLocaleBundle> {
  const document = await getSeoContentDocument();
  return document[locale] ?? { pages: {}, updatedAt: new Date(0).toISOString() };
}

export async function saveSeoLocaleBundleForAdmin(
  locale: Locale,
  bundle: SeoLocaleBundle
): Promise<SeoLocaleBundle> {
  return saveSeoLocaleBundle(locale, {
    ...bundle,
    updatedAt: new Date().toISOString()
  });
}

export async function persistSeoPageFieldsForAdmin(
  locale: Locale,
  pageId: SeoPageId,
  fields: SeoPageFieldsInput
): Promise<{ updatedAt: string }> {
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

  return { updatedAt: next.updatedAt };
}

export async function saveAllCategorySeoFieldsForAdmin(
  categoryId: string,
  seoFields: SeoPageFieldsInput
): Promise<{ updatedAt: string }> {
  const id = categoryId.trim();
  if (!id) {
    throw new Error("מזהה קטגוריה חסר.");
  }

  const fields = pickCategorySeoFields(seoFields);
  const current = await getSeoLocaleBundleForAdmin("he");
  const nextMenu = buildCategorySeoMenuPatch(current.pages?.menu, id, fields);
  const result = await persistSeoPageFieldsForAdmin("he", "menu", nextMenu);

  return { updatedAt: result.updatedAt };
}

export async function removeCategorySeoForAdmin(categoryId: string): Promise<void> {
  const id = categoryId.trim();
  if (!id) return;

  const current = await getSeoLocaleBundleForAdmin("he");
  const menu = current.pages?.menu;
  if (!menu?.categoryIntros?.[id] && !menu?.categoryPages?.[id]) {
    return;
  }

  const categoryIntros = { ...(menu.categoryIntros ?? {}) };
  delete categoryIntros[id];
  const categoryPages = { ...(menu.categoryPages ?? {}) };
  delete categoryPages[id];

  await persistSeoPageFieldsForAdmin("he", "menu", {
    categoryIntros,
    categoryPages
  });

  revalidateSeoContentCache();
}
