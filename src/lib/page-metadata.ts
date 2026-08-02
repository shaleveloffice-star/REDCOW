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
  category: { name: string; description?: string; slug: string; seoIntro?: string }
) {
  const menuMeta = getDefaultPageMeta(locale, "menu");
  const description =
    category.description?.trim() ||
    category.seoIntro?.trim() ||
    menuMeta.description;

  return buildPageMetadata({
    title: `${category.name} | NB BURGER`,
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
