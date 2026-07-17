import { BUSINESS } from "@/data/business";
import { HERO_DEFAULT_IMAGE_URL, SITE_LOGO_SRC } from "@/data/site-images.registry";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { SITE_URL } from "@/lib/seo";
import type { MenuCategory, MenuItem } from "@/types/content";

export type JsonLdObject = Record<string, unknown>;

/** Resolve site-relative paths to absolute URLs for Schema.org. */
export function absoluteUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) {
    return SITE_URL;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${SITE_URL}${path}`;
}

/**
 * Serialize JSON-LD safely for embedding in <script type="application/ld+json">.
 * Escapes `<` to prevent script breakout / XSS.
 */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function isStaticImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }
  return !isVideoMediaUrl(trimmed);
}

export function buildRestaurantJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: BUSINESS.name,
    url: absoluteUrl("/"),
    email: BUSINESS.email,
    image: absoluteUrl(HERO_DEFAULT_IMAGE_URL),
    logo: absoluteUrl(SITE_LOGO_SRC),
    servesCuisine: BUSINESS.cuisineHe,
    priceRange: "₪₪",
    acceptsReservations: false,
    hasMenu: absoluteUrl("/menu"),
    sameAs: [
      BUSINESS.social.facebook,
      BUSINESS.social.instagram,
      BUSINESS.social.tiktok
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.streetAddress,
      addressLocality: BUSINESS.address.addressLocality,
      addressCountry: "IL"
    },
    openingHoursSpecification: BUSINESS.openingHours.map((interval) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...interval.dayOfWeek],
      opens: interval.opens,
      closes: interval.closes
    }))
  };
}

type MenuGroup = MenuCategory & { items: MenuItem[] };

export function buildMenuJsonLd(groups: MenuGroup[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `תפריט | ${BUSINESS.name}`,
    url: absoluteUrl("/menu"),
    hasMenuSection: groups.map((category) => ({
      "@type": "MenuSection",
      name: category.name,
      ...(category.description
        ? { description: category.description }
        : {}),
      hasMenuItem: category.items.map((item) => {
        const description = item.description.trim();
        const menuItem: JsonLdObject = {
          "@type": "MenuItem",
          name: item.name,
          offers: {
            "@type": "Offer",
            price: String(item.price),
            priceCurrency: "ILS"
          }
        };

        if (description) {
          menuItem.description = description;
        }

        if (isStaticImageUrl(item.imageUrl)) {
          menuItem.image = absoluteUrl(item.imageUrl);
        }

        return menuItem;
      })
    }))
  };
}
