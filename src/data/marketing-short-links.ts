/**
 * Central registry of marketing short links (UTM landing redirects).
 * Add a row here, then next.config.ts picks it up automatically.
 *
 * Example future entries: influencer-daniel, flyer, qr, meta-summer
 */

export type MarketingUtmParams = {
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
};

export type MarketingShortLink = {
  /** Public path without leading slash, e.g. "ig" → /ig */
  slug: string;
  /** Relative site path to land on, e.g. "/" or "/menu" */
  destinationPath: string;
  utm: MarketingUtmParams;
};

export const MARKETING_SHORT_LINKS: MarketingShortLink[] = [
  {
    slug: "ig",
    destinationPath: "/",
    utm: {
      source: "instagram",
      medium: "social",
      campaign: "organic_social"
    }
  },
  {
    slug: "fb",
    destinationPath: "/",
    utm: {
      source: "facebook",
      medium: "social",
      campaign: "organic_social"
    }
  },
  {
    slug: "wa",
    destinationPath: "/",
    utm: {
      source: "whatsapp",
      medium: "messaging",
      campaign: "organic_social"
    }
  },
  {
    slug: "tiktok",
    destinationPath: "/",
    utm: {
      source: "tiktok",
      medium: "social",
      campaign: "organic_social"
    }
  }
];

export function buildMarketingShortLinkDestination(link: MarketingShortLink): string {
  const params = new URLSearchParams();
  params.set("utm_source", link.utm.source);
  params.set("utm_medium", link.utm.medium);
  params.set("utm_campaign", link.utm.campaign);
  if (link.utm.content) params.set("utm_content", link.utm.content);
  if (link.utm.term) params.set("utm_term", link.utm.term);

  const path = link.destinationPath.startsWith("/")
    ? link.destinationPath
    : `/${link.destinationPath}`;
  const query = params.toString();

  if (path === "/") {
    return `/?${query}`;
  }
  return `${path}?${query}`;
}

/** Next.js redirects() entries — always temporary (302) for campaign flexibility. */
export function getMarketingShortLinkRedirects(): Array<{
  source: string;
  destination: string;
  permanent: false;
}> {
  return MARKETING_SHORT_LINKS.map((link) => ({
    source: `/${link.slug}`,
    destination: buildMarketingShortLinkDestination(link),
    permanent: false as const
  }));
}
