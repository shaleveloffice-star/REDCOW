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

export function buildCategorySeoMenuPatch(
  currentMenu: SeoPageFieldsInput | undefined,
  categoryId: string,
  fields: SeoPageFieldsInput
): SeoPageFieldsInput {
  const categoryFields: SeoPageFieldsInput = {
    introduction: fields.introduction,
    bottomContent: fields.bottomContent,
    faq: fields.faq,
    cta: fields.cta
  };

  return sanitizeSeoPageFields({
    ...(currentMenu ?? {}),
    categoryIntros: {
      ...(currentMenu?.categoryIntros ?? {}),
      [categoryId]: fields.introduction ?? ""
    },
    categoryPages: {
      ...(currentMenu?.categoryPages ?? {}),
      [categoryId]: categoryFields
    }
  });
}
