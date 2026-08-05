import { BUSINESS } from "@/data/business";
import { SITE_LOGO_SCHEMA_SRC } from "@/data/brand-assets";
import { getLocalizedCategoryName, getLocalizedCategoryDescription } from "@/i18n/category-translations";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import { resolveCategorySlug } from "@/lib/menu/category-slug";
import { getMessages, type Messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";
import type { MenuGroupWithDisplay, MenuItemWithDisplay } from "@/lib/translation/menu-display";
import type { MenuCategory, MenuItem } from "@/types/content";
import type { SeoFaqItem } from "@/types/seo-content";

export type JsonLdObject = Record<string, unknown>;

/** Resolve site-relative paths to absolute URLs for Schema.org. */
export function absoluteUrl(pathOrUrl?: string | null): string {
  const trimmed = String(pathOrUrl ?? "").trim();
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

function isStaticImageUrl(url?: string | null): boolean {
  const trimmed = String(url ?? "").trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return false;
  }
  return !isVideoMediaUrl(trimmed);
}

export function buildOrganizationJsonLd(): JsonLdObject {
  const logoUrl = absoluteUrl(SITE_LOGO_SCHEMA_SRC);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS.name,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      width: 512,
      height: 512
    },
    image: logoUrl,
    sameAs: [
      BUSINESS.social.facebook,
      BUSINESS.social.instagram,
      BUSINESS.social.tiktok
    ]
  };
}

export function buildRestaurantJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: BUSINESS.name,
    url: absoluteUrl("/"),
    email: BUSINESS.email,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    logo: absoluteUrl(SITE_LOGO_SCHEMA_SRC),
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
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

export function buildMenuJsonLd(
  groups: MenuGroupWithDisplay[] | MenuGroup[],
  locale: Locale = "he",
  messages?: Messages
): JsonLdObject {
  const t = messages ?? getMessages(locale);

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${t.nav.menu} | ${BUSINESS.name}`,
    url: absoluteUrl("/menu"),
    hasMenuSection: groups.map((category) => ({
      "@type": "MenuSection",
      name: getLocalizedCategoryName(category, locale),
      url: absoluteUrl(`/menu/${resolveCategorySlug(category)}`),
      ...(category.description
        ? { description: getLocalizedCategoryDescription(category, locale) || category.description }
        : {}),
      hasMenuItem: category.items.map((item) => {
        const localized = getLocalizedMenuItem(item, locale);
        const description = String(localized.description ?? "").trim();
        const menuItem: JsonLdObject = {
          "@type": "MenuItem",
          name: localized.name,
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

export function buildProductJsonLd(
  item: MenuItemWithDisplay | MenuItem,
  options: { slug: string; locale?: Locale }
): JsonLdObject {
  const locale = options.locale ?? "he";
  const localized = getLocalizedMenuItem(item, locale);
  const description =
    item.metaDescription?.trim() ||
    String(localized.description ?? "").trim() ||
    String(item.longDescription ?? "").trim() ||
    localized.name;

  const product: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localized.name,
    description,
    brand: {
      "@type": "Brand",
      name: BUSINESS.name
    },
    url: absoluteUrl(`/menu/${options.slug}`),
    offers: {
      "@type": "Offer",
      price: String(item.price),
      priceCurrency: "ILS",
      availability: item.isActive
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/menu/${options.slug}`)
    }
  };

  if (isStaticImageUrl(item.imageUrl)) {
    product.image = absoluteUrl(item.imageUrl);
  }

  return product;
}

export function buildProductBreadcrumbJsonLd(
  item: MenuItemWithDisplay | MenuItem,
  options: {
    slug: string;
    locale?: Locale;
    categoryName?: string;
    categorySlug?: string;
    messages?: Messages;
  }
): JsonLdObject {
  const locale = options.locale ?? "he";
  const t = options.messages ?? getMessages(locale);
  const localized = getLocalizedMenuItem(item, locale);
  const categoryName = options.categoryName?.trim();
  const categorySlug = options.categorySlug?.trim();

  const itemListElement: JsonLdObject[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: t.nav.home,
      item: absoluteUrl("/")
    },
    {
      "@type": "ListItem",
      position: 2,
      name: t.nav.menu,
      item: absoluteUrl("/menu")
    }
  ];

  if (categoryName && categorySlug) {
    itemListElement.push({
      "@type": "ListItem",
      position: 3,
      name: categoryName,
      item: absoluteUrl(`/menu/${categorySlug}`)
    });
  }

  itemListElement.push({
    "@type": "ListItem",
    position: itemListElement.length + 1,
    name: localized.name,
    item: absoluteUrl(`/menu/${options.slug}`)
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement
  };
}

export function buildStaticPageBreadcrumbJsonLd(options: {
  pageName: string;
  pagePath: `/${string}`;
  locale?: Locale;
  messages?: Messages;
}): JsonLdObject {
  const locale = options.locale ?? "he";
  const t = options.messages ?? getMessages(locale);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t.nav.home,
        item: absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: options.pageName,
        item: absoluteUrl(options.pagePath)
      }
    ]
  };
}

export function buildFaqPageJsonLd(items: SeoFaqItem[]): JsonLdObject | null {
  const validItems = items.filter((item) => item.question.trim() && item.answer.trim());
  if (validItems.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validItems.map((item) => ({
      "@type": "Question",
      name: item.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.trim()
      }
    }))
  };
}

export function buildCategoryBreadcrumbJsonLd(options: {
  categoryName: string;
  categorySlug: string;
  locale?: Locale;
  messages?: Messages;
}): JsonLdObject {
  const locale = options.locale ?? "he";
  const t = options.messages ?? getMessages(locale);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t.nav.home,
        item: absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t.nav.menu,
        item: absoluteUrl("/menu")
      },
      {
        "@type": "ListItem",
        position: 3,
        name: options.categoryName,
        item: absoluteUrl(`/menu/${options.categorySlug}`)
      }
    ]
  };
}
