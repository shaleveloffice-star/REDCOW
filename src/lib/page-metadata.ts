import type { Metadata } from "next";

import { getDefaultPageMeta } from "@/data/seo-content-defaults";
import type { Locale } from "@/i18n/config";
import { getCachedResolvedSeoPageContent } from "@/lib/cache/cached-data";
import { buildPageMetadata } from "@/lib/seo";
import type { SeoPageId } from "@/types/seo-content";

const PAGE_PATHS: Record<SeoPageId, string> = {
  home: "/",
  about: "/about",
  menu: "/menu",
  locations: "/locations",
  privacy: "/privacy-policy",
  terms: "/terms"
};

async function getSeoPageMetadata(locale: Locale, pageId: SeoPageId): Promise<Metadata> {
  const content = await getCachedResolvedSeoPageContent(locale, pageId);
  const fallback = getDefaultPageMeta(locale, pageId);

  return buildPageMetadata({
    title: content.metaTitle.trim() || fallback.title,
    description: content.metaDescription.trim() || fallback.description,
    path: PAGE_PATHS[pageId],
    locale
  });
}

export async function getHomePageMetadata(locale: Locale) {
  return getSeoPageMetadata(locale, "home");
}

export async function getMenuPageMetadata(locale: Locale) {
  return getSeoPageMetadata(locale, "menu");
}

export function getMenuCategoryPageMetadata(
  locale: Locale,
  category: {
    name: string;
    description?: string;
    slug: string;
    seoIntro?: string;
    metaTitle?: string;
    metaDescription?: string;
  }
) {
  const menuMeta = getDefaultPageMeta(locale, "menu");
  const generatedTitle = `${category.name} | NB BURGER`;
  const title = category.metaTitle?.trim() || generatedTitle;
  const description =
    category.metaDescription?.trim() ||
    category.description?.trim() ||
    category.seoIntro?.trim() ||
    menuMeta.description;

  return buildPageMetadata({
    title,
    description,
    path: `/menu/${category.slug}`,
    locale
  });
}

export async function getLocationsPageMetadata(locale: Locale) {
  return getSeoPageMetadata(locale, "locations");
}

export async function getAboutPageMetadata(locale: Locale) {
  return getSeoPageMetadata(locale, "about");
}

export async function getPrivacyPageMetadata(locale: Locale) {
  return getSeoPageMetadata(locale, "privacy");
}

export async function getTermsPageMetadata(locale: Locale) {
  return getSeoPageMetadata(locale, "terms");
}

export async function getStoriesIndexMetadata(locale: Locale) {
  const { getMessages } = await import("@/i18n/messages");
  const t = getMessages(locale);

  return buildPageMetadata({
    title: t.stories.indexMetaTitle,
    description: t.stories.indexMetaDescription,
    path: "/stories",
    locale
  });
}

export function getStoryPageMetadata(
  locale: Locale,
  story: {
    title: string;
    subtitle: string;
    slug: string;
    metaTitle?: string;
    metaDescription?: string;
    heroImageUrl: string;
    heroImageAlt: string;
    ogImageUrl?: string;
  }
) {
  const title = story.metaTitle?.trim() || `${story.title.trim()} | NB BURGER`;
  const description =
    story.metaDescription?.trim() || story.subtitle.trim() || story.title.trim();
  const image = story.ogImageUrl?.trim() || story.heroImageUrl.trim();

  return buildPageMetadata({
    title,
    description,
    path: `/stories/${story.slug.trim()}`,
    image,
    imageAlt: story.heroImageAlt.trim() || story.title.trim(),
    locale
  });
}
