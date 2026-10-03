import { normalizeMenuImageZoom } from "@/lib/menu/image-zoom";
import type { SiteImagesMap } from "@/types/site-images";

export const SITE_IMAGE_ZOOM_SUFFIX = "__zoom";

export function siteImageZoomId(id: string): string {
  return `${id}${SITE_IMAGE_ZOOM_SUFFIX}`;
}

export function normalizeSiteImageZoom(raw: unknown): number {
  const value = typeof raw === "number" ? raw : Number(raw);
  return Math.round(normalizeMenuImageZoom(value) * 100) / 100;
}

/** Serialized into SiteImagesMap so the zoom travels through the same cached map as the image URLs. */
export function encodeSiteImageZoom(raw: unknown): string {
  const zoom = normalizeSiteImageZoom(raw);
  return zoom === 1 ? "" : String(zoom);
}

export function pickSiteImageZoom(map: SiteImagesMap | undefined, id: string): number {
  const raw = map?.[siteImageZoomId(id)];
  return raw ? normalizeSiteImageZoom(raw) : 1;
}
