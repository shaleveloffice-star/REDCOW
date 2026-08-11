import type { SiteImagesMap } from "@/types/site-images";

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

/** Adds cache-bust query only for local static assets when no override is active. */
export function resolveSiteImageUrl(
  map: SiteImagesMap | undefined,
  id: string,
  fallback: string,
  cacheVersion?: string
): string {
  const url = pickSiteImage(map, id, fallback);
  if (!cacheVersion || !url.startsWith("/") || url.includes("?")) {
    return url;
  }
  if (url === fallback) {
    return `${url}?v=${cacheVersion}`;
  }
  return url;
}
