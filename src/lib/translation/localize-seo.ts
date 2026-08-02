import "server-only";

import type { Locale } from "@/i18n/config";
import { splitParagraphs } from "@/lib/seo-content/paragraphs";
import { translateValueForLocale } from "@/lib/translation/translate-texts";
import type { ResolvedCategorySeoContent, ResolvedSeoPageContent } from "@/types/seo-content";

export async function localizeResolvedSeoPageContent(
  content: ResolvedSeoPageContent,
  locale: Locale
): Promise<ResolvedSeoPageContent> {
  if (locale === "he") {
    return content;
  }

  try {
    const translated = await translateValueForLocale(content, locale);
    return {
      ...translated,
      introductionParagraphs: splitParagraphs(translated.introduction),
      bottomParagraphs: splitParagraphs(translated.bottomContent)
    };
  } catch (error) {
    console.error("[translation] Failed to localize SEO page content", error);
    return content;
  }
}

export async function localizeResolvedCategorySeoContent(
  content: ResolvedCategorySeoContent,
  locale: Locale
): Promise<ResolvedCategorySeoContent> {
  if (locale === "he") {
    return content;
  }

  try {
    return await translateValueForLocale(content, locale);
  } catch (error) {
    console.error("[translation] Failed to localize category SEO content", error);
    return content;
  }
}
