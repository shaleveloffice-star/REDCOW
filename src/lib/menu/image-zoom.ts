import type { CSSProperties } from "react";

import {
  DEFAULT_SITE_IMAGE_FOCUS,
  normalizeSiteImageFocus,
  siteImageFocusCssVars,
  type SiteImageFocus
} from "@/lib/site-image-focus";

export function normalizeMenuImageZoom(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(3, Math.max(1, value)) : 1;
}

/** Clip the enlarged image back to its original frame; the source file is untouched. */
export function menuImageZoomStyle(
  value: unknown,
  focus: SiteImageFocus = DEFAULT_SITE_IMAGE_FOCUS
): CSSProperties | undefined {
  const zoom = normalizeMenuImageZoom(value);
  const point = normalizeSiteImageFocus(focus);
  const origin = `${point.x}% ${point.y}%`;
  if (zoom === 1) {
    if (point.x === 50 && point.y === 50) return undefined;
    return { objectPosition: origin, transformOrigin: origin };
  }
  return {
    scale: zoom,
    objectPosition: origin,
    transformOrigin: origin,
    clipPath: `inset(${(1 - 1 / zoom) * 50}%)`
  };
}

/** Zoom + desktop/mobile focus as CSS vars (pair with `.site-media-focus`). */
export function menuImageMediaStyle(options: {
  zoom?: unknown;
  focusDesktop?: SiteImageFocus;
  focusMobile?: SiteImageFocus;
}): CSSProperties | undefined {
  const zoom = normalizeMenuImageZoom(options.zoom);
  const desktop = normalizeSiteImageFocus(options.focusDesktop);
  const mobile = normalizeSiteImageFocus(options.focusMobile ?? desktop);
  const vars = siteImageFocusCssVars(desktop, mobile);
  const focusMoved =
    desktop.x !== 50 || desktop.y !== 50 || mobile.x !== 50 || mobile.y !== 50;

  if (zoom === 1 && !focusMoved) return undefined;

  return {
    ...vars,
    ...(zoom === 1
      ? {}
      : {
          scale: zoom,
          clipPath: `inset(${(1 - 1 / zoom) * 50}%)`
        })
  };
}
