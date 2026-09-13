import { cache } from "react";
import { unstable_cache } from "next/cache";

import { CACHE_REVALIDATE_SECONDS } from "@/lib/constants";
import { DEFAULT_MENU_HERO } from "@/lib/menu/menu-hero-config";
import { DEFAULT_PAGE_VISIBILITY } from "@/lib/pages/page-visibility";
import { getMenuHeroConfig } from "@/repositories/menu-hero.repository";
import { getPageVisibility } from "@/repositories/page-visibility.repository";
import {
  getHomepageMenuShowcase,
  getMenuForDisplay,
  getMenuItemBySlugForDisplay,
  getMenuCategoryBySlugForDisplay,
  getMenuItemForDisplay,
  listMenuCategories
} from "@/services/menu.service";
import { getSettings, listOrderLinks } from "@/services/settings.service";
import { resolveStaticSiteImagesMap } from "@/services/site-images-resolver.service";
import { getBrandStoryBySlug, listBrandStories } from "@/services/stories.service";
import { localizeBrandStories, localizeBrandStory } from "@/lib/translation/localize-stories";
import { normalizeStorySlug } from "@/lib/stories/story-slug";
import type { Locale } from "@/i18n/config";

export const CACHE_TAGS = {
  settings: "settings",
  orderLinksActive: "order-links-active",
  siteImages: "site-images",
  homepageMenu: "homepage-menu",
  menuCategories: "menu-categories",
  menuDisplay: "menu-display",
  menuHero: "menu-hero",
  pageVisibility: "page-visibility",
  seoContent: "seo-content",
  brandStories: "brand-stories",
  announcementPopup: "announcement-popup"
} as const;

export const getCachedMenuHero = unstable_cache(
  () => getMenuHeroConfig(),
  [CACHE_TAGS.menuHero],
  { revalidate: CACHE_REVALIDATE_SECONDS.slow, tags: [CACHE_TAGS.menuHero] }
);

// Keep the menu available during a CMS read failure; do not cache the fallback.
export const getCachedPageVisibility = unstable_cache(
  () => getPageVisibility(),
  [CACHE_TAGS.pageVisibility],
  { revalidate: CACHE_REVALIDATE_SECONDS.slow, tags: [CACHE_TAGS.pageVisibility] }
);

export async function getAboutPageEnabled() {
  try {
    return (await getCachedPageVisibility()).aboutEnabled;
  } catch (error) {
    console.error("[page-visibility] read failed", error);
    return DEFAULT_PAGE_VISIBILITY.aboutEnabled;
  }
}

export async function getMenuHeroForDisplay() {
  try {
    return await getCachedMenuHero();
  } catch (error) {
    console.error("[menu-hero] read failed", error);
    return { ...DEFAULT_MENU_HERO };
  }
}

export const getCachedSettings = unstable_cache(
  () => getSettings(),
  [CACHE_TAGS.settings],
  { revalidate: CACHE_REVALIDATE_SECONDS.slow, tags: [CACHE_TAGS.settings] }
);

export const getCachedActiveOrderLinks = unstable_cache(
  () => listOrderLinks({ activeOnly: true }),
  [CACHE_TAGS.orderLinksActive],
  { revalidate: CACHE_REVALIDATE_SECONDS.slow, tags: [CACHE_TAGS.orderLinksActive] }
);

export const getCachedSiteImagesMap = unstable_cache(
  () => resolveStaticSiteImagesMap(),
  [CACHE_TAGS.siteImages],
  { revalidate: CACHE_REVALIDATE_SECONDS.slow, tags: [CACHE_TAGS.siteImages] }
);

export const getCachedHomepageMenu = unstable_cache(
  () => getHomepageMenuShowcase(),
  [CACHE_TAGS.homepageMenu],
  { revalidate: CACHE_REVALIDATE_SECONDS.menu, tags: [CACHE_TAGS.homepageMenu] }
);

export const getCachedMenuCategories = unstable_cache(
  () => listMenuCategories({ activeOnly: true }),
  [CACHE_TAGS.menuCategories],
  { revalidate: CACHE_REVALIDATE_SECONDS.menu, tags: [CACHE_TAGS.menuCategories] }
);

export const getCachedMenuForDisplay = unstable_cache(
  () => getMenuForDisplay(),
  [CACHE_TAGS.menuDisplay],
  {
    revalidate: CACHE_REVALIDATE_SECONDS.menu,
    tags: [CACHE_TAGS.menuDisplay, CACHE_TAGS.menuCategories, CACHE_TAGS.homepageMenu]
  }
);

// Per-request deduplication keeps publication and 404 decisions fresh.
export const getCachedMenuItemById = cache(getMenuItemForDisplay);
export const getCachedMenuItemBySlug = cache(getMenuItemBySlugForDisplay);
export const getCachedMenuCategoryBySlug = cache(getMenuCategoryBySlugForDisplay);

export function getCachedResolvedSeoPageContent(locale: string, pageId: string) {
  return unstable_cache(
    async () => {
      const { getResolvedSeoPageContent } = await import("@/services/seo-content.service");
      const { LOCALES } = await import("@/i18n/config");
      const resolvedLocale = LOCALES.includes(locale as (typeof LOCALES)[number])
        ? (locale as (typeof LOCALES)[number])
        : "he";
      return getResolvedSeoPageContent(resolvedLocale, pageId as import("@/types/seo-content").SeoPageId);
    },
    // menu-intent-slug-v1: bust stale menu category SEO after slug-based intent fix
    [CACHE_TAGS.seoContent, locale, pageId, pageId === "menu" ? "menu-intent-slug-v1" : "v0"],
    {
      revalidate: CACHE_REVALIDATE_SECONDS.slow,
      tags: [CACHE_TAGS.seoContent]
    }
  )();
}

export const getCachedBrandStories = unstable_cache(
  async (locale: Locale) => {
    const stories = await listBrandStories({ activeOnly: true });
    return localizeBrandStories(stories, locale);
  },
  [CACHE_TAGS.brandStories, "list"],
  { revalidate: CACHE_REVALIDATE_SECONDS.slow, tags: [CACHE_TAGS.brandStories] }
);

export async function getCachedMagazineStories(locale: Locale) {
  return unstable_cache(
    async () => {
      const stories = await listBrandStories({ activeOnly: true, magazineOnly: true });
      return localizeBrandStories(stories, locale);
    },
    [CACHE_TAGS.brandStories, "magazine", locale],
    { revalidate: CACHE_REVALIDATE_SECONDS.slow, tags: [CACHE_TAGS.brandStories] }
  )();
}

export const getCachedBrandStoryBySlug = cache(async (slug: string, locale: Locale) => {
  const story = await getBrandStoryBySlug(normalizeStorySlug(slug), { activeOnly: true });
  return story ? localizeBrandStory(story, locale) : null;
});

export const getCachedAnnouncementPopup = unstable_cache(
  async () => {
    const { getAnnouncementPopup } = await import("@/services/announcement-popup.service");
    return getAnnouncementPopup();
  },
  [CACHE_TAGS.announcementPopup, "v1"],
  { revalidate: CACHE_REVALIDATE_SECONDS.slow, tags: [CACHE_TAGS.announcementPopup] }
);
