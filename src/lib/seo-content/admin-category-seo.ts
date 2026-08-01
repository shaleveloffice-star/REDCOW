import type { Locale } from "@/i18n/config";
import { getDefaultSeoPageFields } from "@/data/seo-content-defaults";
import { sanitizeSeoPageFields } from "@/lib/seo-content/sanitize-seo-storage";
import type { SeoContentDocument, SeoPageFieldsInput } from "@/types/seo-content";

export function getStoredCategorySeoFields(
  document: SeoContentDocument,
  locale: Locale,
  categoryId: string
): SeoPageFieldsInput {
  const menuPage = document[locale]?.pages?.menu;
  const stored = menuPage?.categoryPages?.[categoryId];

  return {
    introduction: stored?.introduction ?? menuPage?.categoryIntros?.[categoryId] ?? "",
    bottomContent: stored?.bottomContent ?? "",
    faq: stored?.faq,
    cta: stored?.cta
  };
}

export function getDefaultCategorySeoFields(locale: Locale, categoryId: string): SeoPageFieldsInput {
  const intro = getDefaultSeoPageFields(locale, "menu").categoryIntros?.[categoryId] ?? "";
  return { introduction: intro };
}

export function resolveCategorySeoFieldsForSave(
  seoByLocale: Partial<Record<Locale, SeoPageFieldsInput>>,
  seoDocument: SeoContentDocument,
  locale: Locale,
  categoryId: string
): SeoPageFieldsInput {
  return seoByLocale[locale] ?? getStoredCategorySeoFields(seoDocument, locale, categoryId);
}

export function buildCategorySeoMenuPatch(
  currentMenu: SeoPageFieldsInput | undefined,
  categoryId: string,
  fields: SeoPageFieldsInput
): SeoPageFieldsInput {
  const currentCategory = currentMenu?.categoryPages?.[categoryId] ?? {};
  const mergedCategory: SeoPageFieldsInput = {
    ...currentCategory,
    ...(fields.introduction !== undefined ? { introduction: fields.introduction } : {}),
    ...(fields.bottomContent !== undefined ? { bottomContent: fields.bottomContent } : {}),
    ...(fields.faq !== undefined ? { faq: fields.faq } : {}),
    ...(fields.cta !== undefined ? { cta: fields.cta } : {})
  };

  const categoryIntros = { ...(currentMenu?.categoryIntros ?? {}) };
  if (fields.introduction !== undefined) {
    categoryIntros[categoryId] = fields.introduction;
  }

  return sanitizeSeoPageFields({
    ...(currentMenu ?? {}),
    categoryIntros,
    categoryPages: {
      ...(currentMenu?.categoryPages ?? {}),
      [categoryId]: mergedCategory
    }
  });
}
