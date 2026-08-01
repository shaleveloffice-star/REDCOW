import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { MenuPageView } from "@/components/features/menu/menu-page-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getLocalizedCategoryName } from "@/i18n/category-translations";
import { getServerLocale } from "@/i18n/get-locale";
import {
  getCachedActiveOrderLinks,
  getCachedMenuCategoryBySlug,
  getCachedMenuForDisplay,
  getCachedResolvedSeoPageContent
} from "@/lib/cache/cached-data";
import { resolveCategorySlug } from "@/lib/menu/category-slug";
import { getMenuCategoryPageMetadata } from "@/lib/page-metadata";
import { buildMenuJsonLd } from "@/lib/seo/json-ld";
import { listMenuCategories } from "@/services/menu.service";
import type { OrderLink } from "@/types/content";

type MenuCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

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
  const categories = await listMenuCategories({ activeOnly: true });
  return categories.map((category) => ({ slug: resolveCategorySlug(category) }));
}

export async function generateMetadata({ params }: MenuCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [category, locale] = await Promise.all([
    getCachedMenuCategoryBySlug(slug),
    getServerLocale()
  ]);

  if (!category) {
    return getMenuCategoryPageMetadata(locale, {
      name: "קטגוריה",
      slug,
      description: ""
    });
  }

  return getMenuCategoryPageMetadata(locale, {
    name: getLocalizedCategoryName(category, locale),
    slug: resolveCategorySlug(category),
    description: category.description
  });
}

export default async function MenuCategoryPage({ params }: MenuCategoryPageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const category = await getCachedMenuCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const resolvedSlug = resolveCategorySlug(category);
  if (slug.trim().toLowerCase() !== resolvedSlug) {
    redirect(`/menu/category/${resolvedSlug}`);
  }

  const [groups, orderLinks, seoContent] = await Promise.all([
    getCachedMenuForDisplay(),
    getCachedActiveOrderLinks(),
    getCachedResolvedSeoPageContent(locale, "menu")
  ]);
  const { pickupUrl, deliveryUrl } = resolveOrderUrls(orderLinks);

  return (
    <>
      <JsonLd data={buildMenuJsonLd(groups, locale)} />
      <main id="main-content" className="menu-page">
        <div className="menu-page-inner">
          <MenuPageView
            groups={groups}
            pickupUrl={pickupUrl}
            deliveryUrl={deliveryUrl}
            seoContent={seoContent}
            activeCategoryId={category.id}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
