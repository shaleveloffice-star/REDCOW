import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { MenuCategoryView } from "@/components/features/menu/menu-category-view";
import { MenuItemDetailView } from "@/components/features/menu/menu-item-detail-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getLocalizedCategoryName } from "@/i18n/category-translations";
import { getServerLocale } from "@/i18n/get-locale";
import { getLocalizedMenuItem } from "@/i18n/menu-translations";
import {
  getCachedActiveOrderLinks,
  getCachedMenuCategories,
  getCachedMenuForDisplay,
  getCachedMenuCategoryBySlug,
  getCachedMenuItemBySlug,
  getCachedResolvedSeoPageContent
} from "@/lib/cache/cached-data";
import { resolveCategorySlug } from "@/lib/menu/category-slug";
import { normalizeMenuSlugParam, resolveMenuOrderUrls } from "@/lib/menu/menu-page-utils";
import { resolveMenuItemSlug } from "@/lib/menu/product-slug";
import { getMenuCategoryPageMetadata } from "@/lib/page-metadata";
import { buildPageMetadata } from "@/lib/seo";
import {
  absoluteUrl,
  buildCategoryBreadcrumbJsonLd,
  buildProductBreadcrumbJsonLd,
  buildProductJsonLd
} from "@/lib/seo/json-ld";
import { getResolvedCategorySeo } from "@/lib/seo-content/resolve-seo-content";
import { splitParagraphs } from "@/lib/seo-content/paragraphs";
import { listMenuCategories, listMenuItems } from "@/services/menu.service";

type MenuSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const [categories, items] = await Promise.all([
    listMenuCategories({ activeOnly: true }),
    listMenuItems({ activeOnly: true })
  ]);

  const reserved = new Set(
    categories.map((category) => resolveCategorySlug(category).toLowerCase())
  );

  const params = categories.map((category) => ({
    slug: resolveCategorySlug(category)
  }));

  for (const item of items) {
    const itemSlug = resolveMenuItemSlug(item).toLowerCase();
    if (!reserved.has(itemSlug)) {
      params.push({ slug: resolveMenuItemSlug(item) });
    }
  }

  return params;
}

export async function generateMetadata({ params }: MenuSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const normalized = normalizeMenuSlugParam(slug);

  const category = await getCachedMenuCategoryBySlug(normalized);
  if (category) {
    const seoContent = await getCachedResolvedSeoPageContent(locale, "menu");
    const categorySeo = getResolvedCategorySeo(seoContent, category.id);
    const introLead = splitParagraphs(categorySeo.introduction)[0] ?? "";

    return getMenuCategoryPageMetadata(locale, {
      name: getLocalizedCategoryName(category, locale),
      slug: resolveCategorySlug(category),
      description: category.description,
      seoIntro: introLead
    });
  }

  const item = await getCachedMenuItemBySlug(normalized);
  if (!item) {
    return buildPageMetadata({
      title: "מנה | NB BURGER רעננה",
      description: "מנה מתוך תפריט NB BURGER.",
      path: `/menu/${slug}`
    });
  }

  const localized = getLocalizedMenuItem(item, locale);
  const resolvedSlug = resolveMenuItemSlug(item);
  const title = item.metaTitle?.trim() || `${localized.name} | NB BURGER רעננה`;
  const description =
    item.metaDescription?.trim() ||
    localized.description.trim() ||
    localized.longDescription.trim() ||
    `${localized.name} — NB BURGER רעננה`;
  const imageUrl = String(item.imageUrl ?? "").trim();

  return buildPageMetadata({
    title,
    description,
    path: `/menu/${resolvedSlug}`,
    locale,
    ...(imageUrl ? { image: absoluteUrl(imageUrl), imageAlt: localized.imageAlt } : {})
  });
}

export default async function MenuSlugPage({ params }: MenuSlugPageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const normalized = normalizeMenuSlugParam(slug);

  const category = await getCachedMenuCategoryBySlug(normalized);
  if (category) {
    const resolvedSlug = resolveCategorySlug(category);
    if (normalized !== resolvedSlug) {
      redirect(`/menu/${resolvedSlug}`);
    }

    const [groups, orderLinks, seoContent] = await Promise.all([
      getCachedMenuForDisplay(),
      getCachedActiveOrderLinks(),
      getCachedResolvedSeoPageContent(locale, "menu")
    ]);
    const group = groups.find((entry) => entry.id === category.id);
    if (!group) {
      notFound();
    }

    const categorySeo = getResolvedCategorySeo(seoContent, category.id);
    const { pickupUrl, deliveryUrl } = resolveMenuOrderUrls(orderLinks);
    const categoryName = getLocalizedCategoryName(category, locale);

    return (
      <>
        <JsonLd
          data={buildCategoryBreadcrumbJsonLd({
            categoryName,
            categorySlug: resolvedSlug,
            locale
          })}
        />
        <main id="main-content" className="menu-page">
          <div className="menu-page-inner">
            <MenuCategoryView
              group={group}
              allGroups={groups}
              categorySeo={categorySeo}
              pickupUrl={pickupUrl}
              deliveryUrl={deliveryUrl}
            />
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const item = await getCachedMenuItemBySlug(normalized);
  if (!item) {
    notFound();
  }

  const resolvedSlug = resolveMenuItemSlug(item);
  if (normalized !== resolvedSlug.toLowerCase()) {
    redirect(`/menu/${resolvedSlug}`);
  }

  const [orderLinks, categories] = await Promise.all([
    getCachedActiveOrderLinks(),
    getCachedMenuCategories()
  ]);
  const categoryName = categories.find((entry) => entry.id === item.categoryId)?.name;
  const { pickupUrl, deliveryUrl } = resolveMenuOrderUrls(orderLinks);

  return (
    <>
      <JsonLd data={buildProductJsonLd(item, { slug: resolvedSlug, locale })} />
      <JsonLd data={buildProductBreadcrumbJsonLd(item, { slug: resolvedSlug, locale })} />
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
