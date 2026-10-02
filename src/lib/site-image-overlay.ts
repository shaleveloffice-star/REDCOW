import type { CSSProperties } from "react";

import type { SiteImagesMap } from "@/types/site-images";

export const SITE_IMAGE_OVERLAY_SUFFIX = "__overlay";
export const DEFAULT_SITE_IMAGE_OVERLAY_COLOR = "#000000";
/** Above 90% the image is no longer visible, which defeats the purpose of an image slot. */
export const MAX_SITE_IMAGE_OVERLAY_OPACITY = 0.9;

export type SiteImageOverlay = {
  color: string;
  opacity: number;
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function siteImageOverlayId(id: string): string {
  return `${id}${SITE_IMAGE_OVERLAY_SUFFIX}`;
}

export function normalizeOverlayColor(raw: unknown): string {
  return typeof raw === "string" && HEX_COLOR.test(raw.trim())
    ? raw.trim().toLowerCase()
    : DEFAULT_SITE_IMAGE_OVERLAY_COLOR;
}

export function normalizeOverlayOpacity(raw: unknown): number {
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(Math.min(value, MAX_SITE_IMAGE_OVERLAY_OPACITY) * 100) / 100;
}

/** Serialized into SiteImagesMap so the overlay travels through the same cached map as the image URLs. */
export function encodeSiteImageOverlay(color: unknown, opacity: unknown): string {
  const normalizedOpacity = normalizeOverlayOpacity(opacity);
  if (normalizedOpacity === 0) return "";
  return `${normalizeOverlayColor(color)}|${normalizedOpacity}`;
}

export function decodeSiteImageOverlay(raw: string | undefined): SiteImageOverlay | null {
  if (!raw) return null;
  const [color, opacity] = raw.split("|");
  const normalizedOpacity = normalizeOverlayOpacity(opacity);
  if (normalizedOpacity === 0) return null;
  return { color: normalizeOverlayColor(color), opacity: normalizedOpacity };
}

export function pickSiteImageOverlay(
  map: SiteImagesMap | undefined,
  id: string
): SiteImageOverlay | null {
  return decodeSiteImageOverlay(map?.[siteImageOverlayId(id)]);
}

export function siteImageOverlayStyle(overlay: SiteImageOverlay): CSSProperties {
  return { backgroundColor: overlay.color, opacity: overlay.opacity };
}
