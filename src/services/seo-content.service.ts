import type { Locale } from "@/i18n/config";
import { buildCategorySeoMenuPatch, pickCategorySeoFields } from "@/lib/seo-content/admin-category-seo";
import { resolveSeoPageContent } from "@/lib/seo-content/resolve-seo-content";
import { applySeoIntentOverrides } from "@/data/seo-intent-map";
import { mergeSeoPageFields } from "@/lib/seo-content/sanitize-seo-storage";
import { revalidateSeoContentCache } from "@/lib/seo-content/revalidate-seo-cache";
import { getSeoContentDocument, saveSeoLocaleBundle, updateSeoLocaleBundle } from "@/repositories/seo-content.repository";
import type { ResolvedSeoPageContent, SeoContentDocument, SeoLocaleBundle, SeoPageFieldsInput, SeoPageId } from "@/types/seo-content";

export async function getSeoContentStore(): Promise<SeoContentDocument> { return getSeoContentDocument(); }
export async function getStoredSeoPageFields(locale: Locale, pageId: SeoPageId): Promise<SeoPageFieldsInput | undefined> {
  return (await getSeoContentDocument())[locale]?.pages?.[pageId];
}
export async function getResolvedSeoPageContent(locale: Locale, pageId: SeoPageId): Promise<ResolvedSeoPageContent> {
  const stored = await getStoredSeoPageFields(locale, pageId);
  return applySeoIntentOverrides(locale, pageId, resolveSeoPageContent(locale, pageId, stored), stored);
}
export async function saveSeoPageFields(locale: Locale, pageId: SeoPageId, fields: SeoPageFieldsInput): Promise<SeoLocaleBundle> {
  return updateSeoLocaleBundle(locale, current => ({ ...current, pages: { ...current.pages, [pageId]: fields }, updatedAt: new Date().toISOString() }));
}
export async function getSeoLocaleBundleForAdmin(locale: Locale): Promise<SeoLocaleBundle> {
  return (await getSeoContentDocument())[locale] ?? { pages: {}, updatedAt: new Date(0).toISOString() };
}
export async function saveSeoLocaleBundleForAdmin(locale: Locale, bundle: SeoLocaleBundle): Promise<SeoLocaleBundle> {
  return saveSeoLocaleBundle(locale, bundle);
}
export async function persistSeoPageFieldsForAdmin(locale: Locale, pageId: SeoPageId, fields: SeoPageFieldsInput, options?: { categorySlugs?: string[] }): Promise<{ updatedAt: string }> {
  const next = await updateSeoLocaleBundle(locale, current => ({
    ...current, pages: { ...current.pages, [pageId]: mergeSeoPageFields(current.pages?.[pageId], fields) }, updatedAt: new Date().toISOString()
  }));
  revalidateSeoContentCache({ pageId, categorySlugs: options?.categorySlugs });
  return { updatedAt: next.updatedAt };
}
export async function saveCategorySeoFieldsForAdmin(locale: Locale, categoryId: string, seoFields: SeoPageFieldsInput, options?: { categorySlugs?: string[] }): Promise<{ updatedAt: string }> {
  const id = categoryId.trim();
  if (!id) throw new Error("מזהה קטגוריה חסר.");
  const fields = pickCategorySeoFields(seoFields);
  const next = await updateSeoLocaleBundle(locale, current => ({
    ...current, pages: { ...current.pages, menu: buildCategorySeoMenuPatch(current.pages?.menu, id, fields) }, updatedAt: new Date().toISOString()
  }));
  revalidateSeoContentCache({ pageId: "menu", categorySlugs: options?.categorySlugs });
  return { updatedAt: next.updatedAt };
}
export async function saveAllCategorySeoFieldsForAdmin(categoryId: string, fields: SeoPageFieldsInput, options?: { categorySlugs?: string[] }) {
  return saveCategorySeoFieldsForAdmin("he", categoryId, fields, options);
}
export async function removeCategorySeoForAdmin(categoryId: string, options?: { categorySlugs?: string[] }): Promise<void> {
  await updateSeoLocaleBundle("he", current => {
    const menu = current.pages?.menu;
    const categoryPages = { ...menu?.categoryPages }, categoryIntros = { ...menu?.categoryIntros };
    delete categoryPages[categoryId]; delete categoryIntros[categoryId];
    return { ...current, pages: { ...current.pages, menu: { ...menu, categoryPages, categoryIntros } }, updatedAt: new Date().toISOString() };
  });
  revalidateSeoContentCache({ pageId: "menu", categorySlugs: options?.categorySlugs });
}
