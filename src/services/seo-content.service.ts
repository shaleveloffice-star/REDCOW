import type { Locale } from "@/i18n/config";
import { resolveSeoPageContent } from "@/lib/seo-content/resolve-seo-content";
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
  return resolveSeoPageContent(locale, pageId, stored);
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
