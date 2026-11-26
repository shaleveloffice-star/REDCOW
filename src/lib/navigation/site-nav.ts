import {
  SITE_NAV_ITEM_HREFS,
  normalizeSiteNavItemIds
} from "@/data/site-nav-defaults";
import type { SiteNavItemId } from "@/types/content";

export type SiteNavLink = {
  id: SiteNavItemId;
  href: string;
  label: string;
};

export type SiteNavLabelMap = Record<SiteNavItemId, string>;

export type ResolveSiteNavOptions = {
  itemIds: readonly SiteNavItemId[] | unknown;
  labels: SiteNavLabelMap;
  aboutEnabled?: boolean;
  recommendationsEnabled?: boolean;
  magazineEnabled?: boolean;
  /** Footer can omit magazine dropdown target if desired — default includes it as /stories. */
  includeMagazine?: boolean;
};

export function resolveSiteNavLinks({
  itemIds,
  labels,
  aboutEnabled = true,
  recommendationsEnabled = true,
  magazineEnabled = true,
  includeMagazine = true
}: ResolveSiteNavOptions): SiteNavLink[] {
  return normalizeSiteNavItemIds(itemIds)
    .filter((id) => {
      if (id === "about") return aboutEnabled;
      if (id === "recommendations") return recommendationsEnabled;
      if (id === "magazine") return includeMagazine && magazineEnabled;
      return true;
    })
    .map((id) => ({
      id,
      href: SITE_NAV_ITEM_HREFS[id],
      label: labels[id]
    }));
}
