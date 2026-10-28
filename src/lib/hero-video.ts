/** Optimized copies of the same approved footage; custom admin media is untouched. */
const HERO_SOURCES = new Set([
  "/videos/sowhat-hero-20261020.mp4",
  "/videos/sowhat-hero-20261020-optimized.mp4",
  "/videos/sowhat-hero-20261027-optimized.mp4"
]);

export const OPTIMIZED_HERO = "/videos/sowhat-hero-20261027-optimized.mp4";
export const HERO_VIDEO_POSTER = "/videos/sowhat-hero-20261027-poster.webp";

export function resolveHeroVideo(src: string, start = 0) {
  const path = src.split(/[?#]/)[0];
  if (!path || !HERO_SOURCES.has(path)) return { src };
  // A first-frame poster is only accurate when playback starts at the beginning.
  return { src: OPTIMIZED_HERO, poster: start === 0 ? HERO_VIDEO_POSTER : undefined };
}
