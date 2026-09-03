/**
 * Home “האווירה” marquee — image URLs + headline placeholders.
 * Swap image paths/URLs here; swap headline lines here (or via i18n later).
 */

import {
  HOME_ATMOSPHERE_SLIDE_1,
  HOME_ATMOSPHERE_SLIDE_2,
  HOME_ATMOSPHERE_SLIDE_3,
  HOME_ATMOSPHERE_THIRD_1,
  HOME_ATMOSPHERE_THIRD_2,
  HOME_ATMOSPHERE_THIRD_3,
  ATMOSPHERE_BURGER_STACK_IMAGE,
  PLANCHA_BURGERS_IMAGE,
  PLANCHA_BITE_IMAGE
} from "@/data/site-images.registry";

/** Bump when replacing marquee assets so browsers drop stale cache. */
export const HOME_ATMOSPHERE_MARQUEE_VERSION = "20260903a";

/** Fixed center headline — edit these lines anytime. */
export const HOME_ATMOSPHERE_MARQUEE_HEADLINE = {
  line1: "WE MAKE",
  line2: "BURGERS.",
  line3: "YOU REMEMBER."
} as const;

export type HomeAtmosphereMarqueeImage = {
  /** Optional admin / site-images override id */
  siteImageId?: string;
  src: string;
  alt: string;
};

/**
 * Three equal columns. Each array is one vertical strip.
 * Duplicate entries are fine — the component loops the list for a seamless belt.
 */
export const HOME_ATMOSPHERE_MARQUEE_COLUMNS: HomeAtmosphereMarqueeImage[][] = [
  [
    {
      siteImageId: "atmosphere-slide-1",
      src: HOME_ATMOSPHERE_SLIDE_1,
      alt: "NB BURGER — המבורגר"
    },
    {
      siteImageId: "atmosphere-third-1",
      src: HOME_ATMOSPHERE_THIRD_1,
      alt: "NB BURGER — אווירה"
    },
    {
      siteImageId: "atmosphere-slide-2",
      src: HOME_ATMOSPHERE_SLIDE_2,
      alt: "NB BURGER — המבורגר"
    },
    {
      src: PLANCHA_BURGERS_IMAGE,
      alt: "NB BURGER — על הפלנצ׳ה"
    }
  ],
  [
    {
      siteImageId: "atmosphere-burger-stack",
      src: ATMOSPHERE_BURGER_STACK_IMAGE,
      alt: "NB BURGER — שכבות המבורגר"
    },
    {
      siteImageId: "atmosphere-slide-3",
      src: HOME_ATMOSPHERE_SLIDE_3,
      alt: "NB BURGER — המבורגר"
    },
    {
      siteImageId: "atmosphere-third-2",
      src: HOME_ATMOSPHERE_THIRD_2,
      alt: "NB BURGER — אווירה"
    },
    {
      src: PLANCHA_BITE_IMAGE,
      alt: "NB BURGER — ביס"
    }
  ],
  [
    {
      siteImageId: "atmosphere-third-3",
      src: HOME_ATMOSPHERE_THIRD_3,
      alt: "NB BURGER — אווירה"
    },
    {
      siteImageId: "atmosphere-slide-1",
      src: HOME_ATMOSPHERE_SLIDE_1,
      alt: "NB BURGER — המבורגר"
    },
    {
      siteImageId: "atmosphere-slide-2",
      src: HOME_ATMOSPHERE_SLIDE_2,
      alt: "NB BURGER — המבורגר"
    },
    {
      siteImageId: "atmosphere-third-1",
      src: HOME_ATMOSPHERE_THIRD_1,
      alt: "NB BURGER — אווירה"
    }
  ]
];
