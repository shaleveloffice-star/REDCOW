import { unstable_cache } from "next/cache";

import { CACHE_REVALIDATE_SECONDS } from "@/lib/constants";
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
import type { Locale } from "@/i18n/config";

export const CACHE_TAGS = {
  settings: "settings",
  orderLinksActive: "order-links-active",
  siteImages: "site-images",
  homepageMenu: "homepage-menu",
  menuCategories: "menu-categories",
  menuDisplay: "menu-display",
  seoContent: "seo-content",
  brandStories: "brand-stories"
} as const;

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

export async function getCachedMenuItemById(id: string) {
  return unstable_cache(
    () => getMenuItemForDisplay(id),
    [CACHE_TAGS.menuDisplay, "menu-item", id],
    {
      revalidate: CACHE_REVALIDATE_SECONDS.menu,
      tags: [CACHE_TAGS.menuDisplay, CACHE_TAGS.homepageMenu]
    }
  )();
}

export async function getCachedMenuItemBySlug(slug: string) {
  return unstable_cache(
    () => getMenuItemBySlugForDisplay(slug),
    [CACHE_TAGS.menuDisplay, "menu-item-slug-v2", slug],
    {
      revalidate: CACHE_REVALIDATE_SECONDS.menu,
      tags: [CACHE_TAGS.menuDisplay, CACHE_TAGS.homepageMenu]
    }
  )();
}

export async function getCachedMenuCategoryBySlug(slug: string) {
  return unstable_cache(
    () => getMenuCategoryBySlugForDisplay(slug),
    [CACHE_TAGS.menuDisplay, "menu-category-slug-v2", slug],
    {
      revalidate: CACHE_REVALIDATE_SECONDS.menu,
      tags: [CACHE_TAGS.menuDisplay, CACHE_TAGS.menuCategories]
    }
  )();
}

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
    [CACHE_TAGS.seoContent, locale, pageId],
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

export async function getCachedBrandStoryBySlug(slug: string, locale: Locale) {
  return unstable_cache(
    async () => {
      const story = await getBrandStoryBySlug(slug, { activeOnly: true });
      if (!story) return null;
      return localizeBrandStory(story, locale);
    },
    [CACHE_TAGS.brandStories, "story", slug, locale],
    { revalidate: CACHE_REVALIDATE_SECONDS.slow, tags: [CACHE_TAGS.brandStories] }
  )();
}
