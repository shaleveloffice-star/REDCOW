import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { MenuItemDetailView } from "@/components/features/menu/menu-item-detail-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getServerLocale } from "@/i18n/get-locale";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import {
  getCachedActiveOrderLinks,
  getCachedMenuCategories,
  getCachedMenuItemBySlug
} from "@/lib/cache/cached-data";
import { resolveMenuItemSlug } from "@/lib/menu/product-slug";
import { buildPageMetadata } from "@/lib/seo";
import {
  absoluteUrl,
  buildProductBreadcrumbJsonLd,
  buildProductJsonLd
} from "@/lib/seo/json-ld";
import { listMenuItems } from "@/services/menu.service";
import type { OrderLink } from "@/types/content";

type MenuItemPageProps = {
  params: Promise<{ slug: string }>;
};

function normalizeRequestedSlug(slug: string): string {
  let value = slug.trim();

  try {
    while (/%[0-9A-Fa-f]{2}/.test(value)) {
      const decoded = decodeURIComponent(value);
      if (decoded === value) break;
      value = decoded;
    }
  } catch {
    // Keep the raw slug when decoding fails.
  }

  return value.toLowerCase();
}

function resolveOrderUrls(orderLinks: OrderLink[]) {
  const pickup =
    orderLinks.find((link) => link.type === "pickup" && link.isActive)?.url ?? "/menu";
  const delivery =
    orderLinks.find(
      (link) => (link.type === "delivery" || link.type === "marketplace") && link.isActive
    )?.url ?? "/locations";

  return { pickupUrl: pickup, deliveryUrl: delivery };
}

export async function generateStaticParams() {
  const items = await listMenuItems({ activeOnly: true });
  return items.map((item) => ({ slug: resolveMenuItemSlug(item) }));
}

export async function generateMetadata({ params }: MenuItemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [item, locale] = await Promise.all([
    getCachedMenuItemBySlug(slug),
    getServerLocale()
  ]);

  if (!item) {
    return buildPageMetadata({
      title: "מנה | NB BURGER רעננה",
      description: "מנה מתוך תפריט NB BURGER.",
      path: `/menu/${slug}`
    });
  }

  const localized = getLocalizedMenuItem(item, locale);
  const resolvedSlug = resolveMenuItemSlug(item);
  const title =
    item.metaTitle?.trim() || `${localized.name} | NB BURGER רעננה`;
  const description =
    item.metaDescription?.trim() ||
    localized.description.trim() ||
    localized.longDescription.trim() ||
    `${localized.name} — NB BURGER רעננה`;

  return buildPageMetadata({
    title,
    description,
    path: `/menu/${resolvedSlug}`,
    image: absoluteUrl(item.imageUrl),
    imageAlt: localized.imageAlt
  });
}

export default async function MenuItemPage({ params }: MenuItemPageProps) {
  const { slug } = await params;
  const [item, orderLinks, categories] = await Promise.all([
    getCachedMenuItemBySlug(slug),
    getCachedActiveOrderLinks(),
    getCachedMenuCategories()
  ]);

  if (!item) {
    notFound();
  }

  const resolvedSlug = resolveMenuItemSlug(item);
  if (normalizeRequestedSlug(slug) !== resolvedSlug.toLowerCase()) {
    redirect(`/menu/${resolvedSlug}`);
  }

  const categoryName = categories.find((category) => category.id === item.categoryId)?.name;
  const { pickupUrl, deliveryUrl } = resolveOrderUrls(orderLinks);

  return (
    <>
      <JsonLd data={buildProductJsonLd(item, { slug: resolvedSlug })} />
      <JsonLd data={buildProductBreadcrumbJsonLd(item, { slug: resolvedSlug })} />
      <main id="main-content" className="menu-item-detail-page">
        <MenuItemDetailView
          item={item}
          categoryName={categoryName}
          pickupUrl={pickupUrl}
          deliveryUrl={deliveryUrl}
        />
      </main>
      <SiteFooter />
    </>
  );
}
