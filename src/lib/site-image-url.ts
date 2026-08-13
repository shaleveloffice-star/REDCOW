import type { SiteImagesMap } from "@/types/site-images";

export const SITE_IMAGE_MOBILE_SUFFIX = "__mobile";

export function siteImageMobileId(id: string): string {
  return `${id}${SITE_IMAGE_MOBILE_SUFFIX}`;
}

export function pickSiteImage(
  map: SiteImagesMap | undefined,
  id: string,
  fallback: string
): string {
  if (!map || !(id in map) || !map[id]) {
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
