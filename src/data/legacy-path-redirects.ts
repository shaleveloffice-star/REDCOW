/**
 * Permanent path redirects for retired public URLs whose canonical targets
 * already return 200 on www.sowhat.co.il.
 *
 * Wired into next.config.ts so old hosts (nbburger / sowhat apex) and the
 * canonical host all jump straight to the final path - no domain hop then
 * a second app-level slug redirect.
 *
 * Only add a row when the mapping is documented (legacy slug group / CMS
 * continuity or an explicitly reviewed editorial replacement) and the destination
 * is live. Do not redirect retired products to different products or all articles
 * to the magazine index.
 */

export type LegacyPathRedirect = {
  source: string;
  destination: string;
};

/** Old menu paths to current canonical menu paths. */
export const LEGACY_MENU_PATH_REDIRECTS: readonly LegacyPathRedirect[] = [
  { source: "/menu/hamburger-nb-classic", destination: "/menu/hamburger-so-classic" },
  { source: "/menu/4-piece-nuggets", destination: "/menu/nuggets-4" },
  { source: "/menu/nb-classic-meal", destination: "/menu/so-classic-meal" },
  { source: "/menu/hamburger-nb-truffle", destination: "/menu/so-truffle-burger" },
  { source: "/menu/nb-truffle-meal", destination: "/menu/so-truffle-burger-meal" },
  { source: "/menu/chili-chicken-wings", destination: "/menu/wings-10" },
  // item-nb-burger-konfi (house burger) continues as so-house-burger in production CMS.
  { source: "/menu/hamburger-nb-confit", destination: "/menu/so-house-burger" }
];

/**
 * Editorial replacements reviewed against the live CMS on 2026-10-24.
 * The retired records are absent (not merely inactive). These active articles
 * answer the same specific topics: smash preparation and choosing a restaurant
 * in Raanana. They are replacements, not recovered copies of the deleted text.
 * Other retired articles without a sufficiently relevant replacement stay 404.
 */
export const LEGACY_STORY_PATH_REDIRECTS: readonly LegacyPathRedirect[] = [
  { source: "/stories/smash-burger", destination: "/stories/smash-burger-crispy-edges" },
  { source: "/stories/restaurant-raanana", destination: "/stories/choosing-restaurant-raanana" }
];

export function getLegacyPathRedirects(): Array<{
  source: string;
  destination: string;
  permanent: true;
}> {
  return [...LEGACY_MENU_PATH_REDIRECTS, ...LEGACY_STORY_PATH_REDIRECTS].map((rule) => ({
    source: rule.source,
    destination: rule.destination,
    permanent: true as const
  }));
}
