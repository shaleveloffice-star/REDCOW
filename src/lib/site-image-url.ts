import { SITE_IMAGE_VERSION_QUERIES } from "@/data/site-image-versions";
import type { SiteImagesMap } from "@/types/site-images";

export const SITE_IMAGE_MOBILE_SUFFIX = "__mobile";

const OPTIMIZABLE_LOCAL_QUERIES = new Set<string>(["", ...SITE_IMAGE_VERSION_QUERIES]);
const OPTIMIZABLE_REMOTE_HOST = /\.blob\.vercel-storage\.com$/;

/** True when next/image accepts the URL under next.config images.localPatterns / remotePatterns. */
export function canOptimizeSiteImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) {
    if (src.startsWith("/api/")) return false;
    const queryIndex = src.indexOf("?");
    return OPTIMIZABLE_LOCAL_QUERIES.has(queryIndex === -1 ? "" : src.slice(queryIndex));
  }
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZABLE_REMOTE_HOST.test(url.hostname) && !url.search;
  } catch {
    return false;
  }
}

export function siteImageMobileId(id: string): string {
  return `${id}${SITE_IMAGE_MOBILE_SUFFIX}`;
}

export function pickSiteImage(
  map: SiteImagesMap | undefined,
  id: string,
  fallback: string
): string {
  if (!map || !(id in map)) {
    return fallback;
  }
  return map[id];
}

export function pickSiteImageMobile(
  map: SiteImagesMap | undefined,
  id: string,
  fallback: string
): string {
  return pickSiteImage(map, siteImageMobileId(id), pickSiteImage(map, id, fallback));
}

function withCacheVersion(url: string, fallback: string, cacheVersion?: string): string {
  if (!cacheVersion || !url.startsWith("/") || url.includes("?")) {
    return url;
  }
  if (url === fallback) {
    return `${url}?v=${cacheVersion}`;
  }
  return url;
}

/** Adds cache-bust query only for local static assets when no override is active. */
export function resolveSiteImageUrl(
  map: SiteImagesMap | undefined,
  id: string,
  fallback: string,
  cacheVersion?: string
): string {
  return withCacheVersion(pickSiteImage(map, id, fallback), fallback, cacheVersion);
}

export function resolveSiteImagePair(
  map: SiteImagesMap | undefined,
  id: string,
  fallback: string,
  cacheVersion?: string
): { desktop: string; mobile: string } {
  const desktop = pickSiteImage(map, id, fallback);
  const mobile = pickSiteImageMobile(map, id, fallback);
  return {
    desktop: withCacheVersion(desktop, fallback, cacheVersion),
    mobile: withCacheVersion(mobile, fallback, cacheVersion)
  };
}
