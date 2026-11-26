import type { SiteNavConfig, SiteNavItemId } from "@/types/content";

export const SITE_NAV_ITEM_IDS: readonly SiteNavItemId[] = [
  "home",
  "menu",
  "kosher",
  "locations",
  "recommendations",
  "about",
  "careers",
  "magazine"
] as const;

export const SITE_NAV_ITEM_LABELS_HE: Record<SiteNavItemId, string> = {
  home: "דף הבית",
  menu: "התפריט",
  kosher: "כשרות",
  locations: "מיקומים",
  recommendations: "ממליצים",
  about: "אודות",
  careers: "דרושים",
  magazine: "מגזין"
};

export const SITE_NAV_ITEM_HREFS: Record<SiteNavItemId, string> = {
  home: "/",
  menu: "/menu",
  kosher: "/kosher",
  locations: "/locations",
  recommendations: "/recommendations",
  about: "/about",
  careers: "/careers",
  magazine: "/stories"
};

/** Matches the previous hard-coded public nav, with locations included for all surfaces. */
export const DEFAULT_SITE_NAV_ITEM_IDS: readonly SiteNavItemId[] = [
  "home",
  "menu",
  "kosher",
  "locations",
  "recommendations",
  "about",
  "careers",
  "magazine"
];

export function defaultSiteNavConfig(): SiteNavConfig {
  return {
    itemIds: [...DEFAULT_SITE_NAV_ITEM_IDS],
    updatedAt: new Date(0).toISOString()
  };
}

export function isSiteNavItemId(value: unknown): value is SiteNavItemId {
  return typeof value === "string" && (SITE_NAV_ITEM_IDS as readonly string[]).includes(value);
}

/** Keep known ids, drop unknowns, append any missing defaults at the end. */
export function normalizeSiteNavItemIds(input: unknown): SiteNavItemId[] {
  const seen = new Set<SiteNavItemId>();
  const ordered: SiteNavItemId[] = [];

  if (Array.isArray(input)) {
    for (const value of input) {
      if (!isSiteNavItemId(value) || seen.has(value)) continue;
      ordered.push(value);
      seen.add(value);
    }
  }

  for (const id of DEFAULT_SITE_NAV_ITEM_IDS) {
    if (seen.has(id)) continue;
    ordered.push(id);
    seen.add(id);
  }

  return ordered;
}
