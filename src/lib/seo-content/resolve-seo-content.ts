import type { Locale } from "@/i18n/config";
import { getDefaultSeoPageFields } from "@/data/seo-content-defaults";
import { splitParagraphs } from "@/lib/seo-content/paragraphs";
import type {
  ResolvedCategorySeoContent,
  ResolvedSeoPageContent,
  SeoCtaBlock,
  SeoFaqBlock,
  SeoFaqItem,
  SeoPageFieldsInput,
  SeoPageId
} from "@/types/seo-content";

const EMPTY_FAQ: Required<SeoFaqBlock> & { items: SeoFaqItem[] } = {
  kicker: "",
  title: "",
  lead: "",
  items: []
};

function pickText(stored?: string | null, fallback?: string): string {
  const value = stored?.trim();
  if (value) return value;
  return fallback?.trim() ?? "";
}

function pickFaqBlock(
  stored: SeoFaqBlock | undefined,
  fallback: SeoFaqBlock | undefined
): Required<SeoFaqBlock> & { items: SeoFaqItem[] } {
  const defaultItems = fallback?.items ?? [];
  const storedItems = stored?.items?.filter(
    (item) => item.question.trim() || item.answer.trim()
  );

  return {
    kicker: pickText(stored?.kicker, fallback?.kicker),
    title: pickText(stored?.title, fallback?.title),
    lead: pickText(stored?.lead, fallback?.lead),
    items: storedItems && storedItems.length > 0 ? storedItems : defaultItems
  };
}

function pickCta(stored: SeoCtaBlock | undefined, fallback: SeoCtaBlock | undefined): SeoCtaBlock {
  return {
    title: pickText(stored?.title, fallback?.title) || undefined,
    body: pickText(stored?.body, fallback?.body) || undefined,
    buttonLabel: pickText(stored?.buttonLabel, fallback?.buttonLabel) || undefined,
    buttonHref: pickText(stored?.buttonHref, fallback?.buttonHref) || undefined
  };
}

function pickCategoryIntros(
  stored: Record<string, string> | undefined,
  fallback: Record<string, string> | undefined
): Record<string, string> {
  const merged: Record<string, string> = { ...(fallback ?? {}) };
  if (!stored) return merged;

  for (const [key, value] of Object.entries(stored)) {
    const trimmed = value.trim();
    if (trimmed) {
      merged[key] = trimmed;
    }
  }

  return merged;
}

function resolveCategorySeoFields(
  categoryId: string,
  source: SeoPageFieldsInput,
  categoryIntros: Record<string, string>
): ResolvedCategorySeoContent {
  const stored = source.categoryPages?.[categoryId];
  const storedIntro = stored?.introduction;
  const introduction =
    storedIntro !== undefined
      ? storedIntro.trim()
      : pickText(undefined, categoryIntros[categoryId]);
  const bottomContent = pickText(stored?.bottomContent, "");

  return {
    metaTitle: stored?.metaTitle?.trim() ?? "",
    metaDescription: stored?.metaDescription?.trim() ?? "",
    introduction,
    bottomContent,
    faq: pickFaqBlock(stored?.faq, EMPTY_FAQ),
    cta: pickCta(stored?.cta, {})
  };
}

function buildCategoryPagesMap(
  source: SeoPageFieldsInput,
  categoryIntros: Record<string, string>
): Record<string, ResolvedCategorySeoContent> {
  const ids = new Set([
    ...Object.keys(source.categoryPages ?? {}),
    ...Object.keys(categoryIntros)
  ]);

  const result: Record<string, ResolvedCategorySeoContent> = {};
  for (const categoryId of ids) {
    result[categoryId] = resolveCategorySeoFields(categoryId, source, categoryIntros);
  }
  return result;
}

/** Merge stored CMS fields with built-in defaults. Empty stored values fall back. */
export function resolveSeoPageContent(
  locale: Locale,
  pageId: SeoPageId,
  stored?: SeoPageFieldsInput | null
): ResolvedSeoPageContent {
  const defaults = getDefaultSeoPageFields(locale, pageId);
  const source = stored ?? {};

  const introduction = pickText(source.introduction, defaults.introduction);
  const bottomContent = pickText(source.bottomContent, defaults.bottomContent);
  const categoryIntros = pickCategoryIntros(source.categoryIntros, defaults.categoryIntros);

  return {
    metaTitle: pickText(source.metaTitle, defaults.metaTitle),
    metaDescription: pickText(source.metaDescription, defaults.metaDescription),
    sectionTitle: pickText(source.sectionTitle, defaults.sectionTitle),
    introduction,
    introductionParagraphs: splitParagraphs(introduction),
    bottomContent,
    bottomParagraphs: splitParagraphs(bottomContent),
    faq: pickFaqBlock(source.faq, defaults.faq),
    cta: pickCta(source.cta, defaults.cta),
    categoryIntros,
    categoryPages: buildCategoryPagesMap(source, categoryIntros)
  };
}

export function getResolvedCategorySeo(
  content: ResolvedSeoPageContent,
  categoryId: string
): ResolvedCategorySeoContent {
  return (
    content.categoryPages[categoryId] ?? {
      metaTitle: "",
      metaDescription: "",
      introduction: content.categoryIntros[categoryId]?.trim() ?? "",
      bottomContent: "",
      faq: EMPTY_FAQ,
      cta: {}
    }
  );
}

export function getCategoryIntro(
  content: ResolvedSeoPageContent,
  categoryId: string
): string | undefined {
  const intro = getResolvedCategorySeo(content, categoryId).introduction.trim();
  return intro || undefined;
}

export function getMenuSeoIntroParagraphs(content: ResolvedSeoPageContent): string[] {
  return content.introductionParagraphs;
}
