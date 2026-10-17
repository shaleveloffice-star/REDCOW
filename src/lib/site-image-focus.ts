import type { CSSProperties } from "react";

import type { SiteImagesMap } from "@/types/site-images";

export const SITE_IMAGE_FOCUS_DESKTOP_SUFFIX = "__focusDesktop";
export const SITE_IMAGE_FOCUS_MOBILE_SUFFIX = "__focusMobile";

export type SiteImageFocus = {
  x: number;
  y: number;
};

export const DEFAULT_SITE_IMAGE_FOCUS: SiteImageFocus = { x: 50, y: 50 };

export function siteImageFocusDesktopId(id: string): string {
  return `${id}${SITE_IMAGE_FOCUS_DESKTOP_SUFFIX}`;
}

export function siteImageFocusMobileId(id: string): string {
  return `${id}${SITE_IMAGE_FOCUS_MOBILE_SUFFIX}`;
}

function clampPercent(raw: unknown): number {
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) return 50;
  return Math.round(Math.min(100, Math.max(0, value)));
}

export function normalizeSiteImageFocus(raw: unknown): SiteImageFocus {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_SITE_IMAGE_FOCUS };
  }
  const row = raw as Record<string, unknown>;
  return {
    x: clampPercent(row.x),
    y: clampPercent(row.y)
  };
}

export function encodeSiteImageFocus(raw: unknown): string {
  const focus = normalizeSiteImageFocus(raw);
  if (focus.x === 50 && focus.y === 50) return "";
  return `${focus.x},${focus.y}`;
}

export function decodeSiteImageFocus(raw: string | undefined): SiteImageFocus {
  if (!raw) return { ...DEFAULT_SITE_IMAGE_FOCUS };
  const [x, y] = raw.split(",");
  return normalizeSiteImageFocus({ x, y });
}

export function pickSiteImageFocus(
  map: SiteImagesMap | undefined,
  id: string,
  variant: "desktop" | "mobile" = "desktop"
): SiteImageFocus {
  const key =
    variant === "mobile" ? siteImageFocusMobileId(id) : siteImageFocusDesktopId(id);
  const encoded = map?.[key];
  if (encoded) return decodeSiteImageFocus(encoded);
  // Mobile falls back to desktop focus when unset.
  if (variant === "mobile") {
    return decodeSiteImageFocus(map?.[siteImageFocusDesktopId(id)]);
  }
  return { ...DEFAULT_SITE_IMAGE_FOCUS };
}

/** CSS variables so one element can switch focus at the mobile breakpoint. */
export function siteImageFocusCssVars(
  desktop: SiteImageFocus,
  mobile: SiteImageFocus = desktop
): CSSProperties {
  return {
    ["--media-focus-x" as string]: `${desktop.x}%`,
    ["--media-focus-y" as string]: `${desktop.y}%`,
    ["--media-focus-x-mobile" as string]: `${mobile.x}%`,
    ["--media-focus-y-mobile" as string]: `${mobile.y}%`
  };
}

export function siteImageFocusStyle(focus: SiteImageFocus): CSSProperties {
  const position = `${focus.x}% ${focus.y}%`;
  return {
    objectPosition: position,
    transformOrigin: position
  };
}
