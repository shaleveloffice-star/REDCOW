import type { Locale } from "@/i18n/config";
import { getDefaultSeoPageFields } from "@/data/seo-content-defaults";
import { splitParagraphs } from "@/lib/seo-content/paragraphs";
import type {
  ResolvedSeoPageContent,
  SeoCtaBlock,
  SeoFaqBlock,
  SeoFaqItem,
  SeoPageFieldsInput,
  SeoPageId
} from "@/types/seo-content";

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

  return {
    sectionTitle: pickText(source.sectionTitle, defaults.sectionTitle),
    introduction,
    introductionParagraphs: splitParagraphs(introduction),
    bottomContent,
    bottomParagraphs: splitParagraphs(bottomContent),
    faq: pickFaqBlock(source.faq, defaults.faq),
    cta: pickCta(source.cta, defaults.cta),
    categoryIntros: pickCategoryIntros(source.categoryIntros, defaults.categoryIntros)
  };
}

export function getCategoryIntro(
  content: ResolvedSeoPageContent,
  categoryId: string
): string | undefined {
  const intro = content.categoryIntros[categoryId]?.trim();
  return intro || undefined;
}

export function getMenuSeoIntroParagraphs(content: ResolvedSeoPageContent): string[] {
  return content.introductionParagraphs;
}
