/**
 * Permanent path redirects for retired public URLs whose canonical targets
 * already return 200 on www.sowhat.co.il.
 *
 * Wired into next.config.ts so old hosts (nbburger / sowhat apex) and the
 * canonical host all jump straight to the final path - no domain hop then
 * a second app-level slug redirect.
 *
 * Only add a row when the mapping is documented (legacy slug group / CMS
 * continuity) and the destination is live. Name similarity alone is not enough.
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
  { source: "/menu/chili-chicken-wings", destination: "/menu/wings-10" },
  // item-nb-burger-konfi (house burger) continues as so-house-burger in production CMS.
  { source: "/menu/hamburger-nb-confit", destination: "/menu/so-house-burger" }
];

export function getLegacyPathRedirects(): Array<{
  source: string;
  destination: string;
  permanent: true;
}> {
  return LEGACY_MENU_PATH_REDIRECTS.map((rule) => ({
    source: rule.source,
    destination: rule.destination,
    permanent: true as const
  }));
}
