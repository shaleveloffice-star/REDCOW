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

function rotate<T>(items: T[], offset: number): T[] {
  return items.map((_, index) => items[(index + offset) % items.length]);
}

/**
 * Three vertical strips, each cycling through all six slots from a different starting point.
 * Short mobile cells need several images per strip or the loop shows a gap.
 */
export const HOME_ATMOSPHERE_MARQUEE_COLUMNS: HomeAtmosphereMarqueeImage[][] = [
  rotate(HOME_ATMOSPHERE_SLOTS, 0),
  rotate(HOME_ATMOSPHERE_SLOTS, 2),
  rotate(HOME_ATMOSPHERE_SLOTS, 4)
];
