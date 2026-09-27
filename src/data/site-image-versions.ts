/**
 * Cache-bust query versions for static homepage images.
 * Imported by next.config.ts: next/image only accepts local query strings listed in images.localPatterns.
 */
export const HERO_IMAGE_VERSION = "20260803";
export const HOME_STORY_IMAGE_VERSION = "2";

export const SITE_IMAGE_VERSION_QUERIES = [
  `?v=${HERO_IMAGE_VERSION}`,
  `?v=${HOME_STORY_IMAGE_VERSION}`
] as const;
