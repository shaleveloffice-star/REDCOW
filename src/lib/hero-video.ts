/** Optimized copies of the same approved footage; custom admin media is untouched. */
const ORIGINAL_HERO = "/videos/sowhat-hero-20261020.mp4";
export const OPTIMIZED_HERO = "/videos/sowhat-hero-20261020-optimized.mp4";
export const HERO_VIDEO_POSTER = "/videos/sowhat-hero-20261020-poster.webp";

export function resolveHeroVideo(src: string, start = 0) {
  const path = src.split(/[?#]/)[0];
  if (path !== ORIGINAL_HERO && path !== OPTIMIZED_HERO) return { src };
  // A first-frame poster is only accurate when playback starts at the beginning.
  return { src: OPTIMIZED_HERO, poster: start === 0 ? HERO_VIDEO_POSTER : undefined };
}
