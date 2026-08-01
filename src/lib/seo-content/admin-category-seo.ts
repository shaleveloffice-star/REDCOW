import type { Locale } from "@/i18n/config";
import { getDefaultSeoPageFields } from "@/data/seo-content-defaults";
import { sanitizeSeoPageFields } from "@/lib/seo-content/sanitize-seo-storage";
import type { SeoContentDocument, SeoPageFieldsInput } from "@/types/seo-content";

/** Category SEO uses only these body fields — strips nested menu keys and undefined (Server Actions safe). */
export function pickCategorySeoFields(fields: SeoPageFieldsInput | undefined): SeoPageFieldsInput {
  return sanitizeSeoPageFields({
    introduction: fields?.introduction,
    bottomContent: fields?.bottomContent,
    faq: fields?.faq,
    cta: fields?.cta
  });
}

export function getStoredCategorySeoFields(
  document: SeoContentDocument,
  locale: Locale,
  categoryId: string
): SeoPageFieldsInput {
  const menuPage = document[locale]?.pages?.menu;
  const stored = menuPage?.categoryPages?.[categoryId];

  return pickCategorySeoFields({
    introduction: stored?.introduction ?? menuPage?.categoryIntros?.[categoryId] ?? "",
    bottomContent: stored?.bottomContent ?? "",
    faq: stored?.faq,
    cta: stored?.cta
  });
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
  const fields = seoByLocale[locale] ?? getStoredCategorySeoFields(seoDocument, locale, categoryId);
  return pickCategorySeoFields(fields);
}

export function buildCategorySeoMenuPatch(
  currentMenu: SeoPageFieldsInput | undefined,
  categoryId: string,
  fields: SeoPageFieldsInput
): SeoPageFieldsInput {
  const currentCategory = pickCategorySeoFields(currentMenu?.categoryPages?.[categoryId]);
  const incoming = pickCategorySeoFields(fields);
  const mergedCategory: SeoPageFieldsInput = {
    ...currentCategory,
    ...(incoming.introduction !== undefined ? { introduction: incoming.introduction } : {}),
    ...(incoming.bottomContent !== undefined ? { bottomContent: incoming.bottomContent } : {}),
    ...(incoming.faq !== undefined ? { faq: incoming.faq } : {}),
    ...(incoming.cta !== undefined ? { cta: incoming.cta } : {})
  };

  const categoryIntros = { ...(currentMenu?.categoryIntros ?? {}) };
  if (incoming.introduction !== undefined) {
    categoryIntros[categoryId] = incoming.introduction;
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
