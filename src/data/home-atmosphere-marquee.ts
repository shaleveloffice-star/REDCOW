/**
 * Home “האווירה” marquee — six admin-managed image slots + headline.
 * Every image shown comes from one of the slots below (editable in /admin/pages/home).
 */

import {
  HOME_ATMOSPHERE_SLIDE_1,
  HOME_ATMOSPHERE_SLIDE_2,
  HOME_ATMOSPHERE_SLIDE_3,
  HOME_ATMOSPHERE_THIRD_1,
  HOME_ATMOSPHERE_THIRD_2,
  HOME_ATMOSPHERE_THIRD_3
} from "@/data/site-images.registry";

/** Bump when replacing marquee assets so browsers drop stale cache. */
export const HOME_ATMOSPHERE_MARQUEE_VERSION = "20260903a";

/** Fixed center headline — edit these lines anytime. */
export const HOME_ATMOSPHERE_MARQUEE_HEADLINE = {
  line1: "SO WHAT?",
  line2: "JUST TAKE",
  line3: "A BITE."
} as const;

export type HomeAtmosphereMarqueeImage = {
  /** Admin / site-images override id */
  siteImageId?: string;
  src: string;
  alt: string;
};

/** Slot ids are kept from the original three-panel editor so existing admin choices stay in place. */
export const HOME_ATMOSPHERE_SLOTS: HomeAtmosphereMarqueeImage[] = [
  { siteImageId: "atmosphere-slide-1", src: HOME_ATMOSPHERE_SLIDE_1, alt: "SO WHAT - אווירה" },
  { siteImageId: "atmosphere-slide-2", src: HOME_ATMOSPHERE_SLIDE_2, alt: "SO WHAT - אווירה" },
  { siteImageId: "atmosphere-third-1", src: HOME_ATMOSPHERE_THIRD_1, alt: "SO WHAT - אווירה" },
  { siteImageId: "atmosphere-slide-3", src: HOME_ATMOSPHERE_SLIDE_3, alt: "SO WHAT - אווירה" },
  { siteImageId: "atmosphere-third-2", src: HOME_ATMOSPHERE_THIRD_2, alt: "SO WHAT - אווירה" },
  { siteImageId: "atmosphere-third-3", src: HOME_ATMOSPHERE_THIRD_3, alt: "SO WHAT - אווירה" }
];

export const HOME_ATMOSPHERE_COLUMN_COUNT = 3;

/** Short mobile cells need this many entries per strip or the loop shows a gap. */
const MIN_CELLS_PER_COLUMN = 4;

/**
 * Splits images into strips with no image shared between strips (deduped by src), so the same
 * photo never shows side by side. Slot 1 → strip 1, slot 2 → strip 2, slot 3 → strip 3, slot 4 → strip 1…
 */
export function buildAtmosphereColumns<T extends { src: string }>(
  images: T[],
  columnCount = HOME_ATMOSPHERE_COLUMN_COUNT
): T[][] {
  const seen = new Set<string>();
  const unique = images.filter((image) => {
    const key = image.src.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  if (unique.length === 0) return columns;

  unique.forEach((image, index) => columns[index % columnCount].push(image));

  return columns.map((column, columnIndex) => {
    // Fewer unique images than strips: reuse from the list rather than leave a strip empty.
    const own = column.length > 0 ? column : [unique[columnIndex % unique.length]];
    const filled = [...own];
    while (filled.length < MIN_CELLS_PER_COLUMN) filled.push(...own);
    return filled;
  });
}
