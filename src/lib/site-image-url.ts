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
