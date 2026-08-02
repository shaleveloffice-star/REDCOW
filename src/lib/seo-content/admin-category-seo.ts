import type { Locale } from "@/i18n/config";
import { getDefaultPageMeta, getDefaultSeoPageFields } from "@/data/seo-content-defaults";
import { splitParagraphs } from "@/lib/seo-content/paragraphs";
import { sanitizeSeoPageFields } from "@/lib/seo-content/sanitize-seo-storage";
import type { SeoContentDocument, SeoPageFieldsInput } from "@/types/seo-content";

/** Category SEO fields stored under menu.categoryPages — strips nested menu keys. */
export function pickCategorySeoFields(fields: SeoPageFieldsInput | undefined): SeoPageFieldsInput {
  const faq = fields?.faq
    ? {
        ...fields.faq,
        items: fields.faq.items?.map((item) => ({
          question: item.question ?? "",
          answer: item.answer ?? ""
        }))
      }
    : undefined;

  return sanitizeSeoPageFields({
    metaTitle: fields?.metaTitle,
    metaDescription: fields?.metaDescription,
    introduction: fields?.introduction,
    bottomContent: fields?.bottomContent,
    faq,
    cta: fields?.cta ? { ...fields.cta } : undefined
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
    metaTitle: stored?.metaTitle,
    metaDescription: stored?.metaDescription,
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

/** Placeholder hints for empty category meta fields in admin (Hebrew only). */
export function getCategoryMetaPlaceholders(
  category: { id: string; name: string; description?: string },
  seoFields: SeoPageFieldsInput
): Pick<SeoPageFieldsInput, "metaTitle" | "metaDescription"> {
  const introLead = splitParagraphs(seoFields.introduction ?? "")[0] ?? "";
  const menuMeta = getDefaultPageMeta("he", "menu");

  return {
    metaTitle: `${category.name} | NB BURGER`,
    metaDescription: category.description?.trim() || introLead || menuMeta.description
  };
}

/** Merge stored Hebrew category SEO with in-form edits before save. */
export function buildCategorySeoSavePayload(
  seoDocument: SeoContentDocument,
  categoryId: string,
  seoFields: SeoPageFieldsInput
): SeoPageFieldsInput {
  return pickCategorySeoFields({
    ...getStoredCategorySeoFields(seoDocument, "he", categoryId),
    ...seoFields
  });
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
    ...(incoming.metaTitle !== undefined ? { metaTitle: incoming.metaTitle } : {}),
    ...(incoming.metaDescription !== undefined ? { metaDescription: incoming.metaDescription } : {}),
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
