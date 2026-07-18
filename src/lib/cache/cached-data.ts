import { unstable_cache } from "next/cache";

import { CACHE_REVALIDATE_SECONDS } from "@/lib/constants";
import {
  getHomepageMenuShowcase,
  getMenuForDisplay,
  listMenuCategories
} from "@/services/menu.service";
import { getSettings, listOrderLinks } from "@/services/settings.service";
import { resolveStaticSiteImagesMap } from "@/services/site-images-resolver.service";

export const CACHE_TAGS = {
  settings: "settings",
  orderLinksActive: "order-links-active",
  siteImages: "site-images",
  homepageMenu: "homepage-menu",
  menuCategories: "menu-categories",
  menuDisplay: "menu-display"
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
