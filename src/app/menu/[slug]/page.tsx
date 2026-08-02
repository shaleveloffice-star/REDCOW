import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { MenuCategoryView } from "@/components/features/menu/menu-category-view";
import { MenuItemDetailView } from "@/components/features/menu/menu-item-detail-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { getLocalizedCategoryName } from "@/i18n/category-translations";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
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
import { getCategorySlugAliases, resolveCategorySlug } from "@/lib/menu/category-slug";
import { normalizeMenuSlugParam, resolveMenuOrderUrls } from "@/lib/menu/menu-page-utils";
import { resolveMenuItemSlug, getMenuItemSlugAliases } from "@/lib/menu/product-slug";
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
import {
  localizeCategory,
  localizeMenuGroups,
  localizeMenuItem,
  localizeMenuItems
} from "@/lib/translation/localize-menu";
import { localizeResolvedCategorySeoContent } from "@/lib/translation/localize-seo";
import { listMenuCategories, listMenuItems } from "@/services/menu.service";

type MenuSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const [categories, items] = await Promise.all([
    listMenuCategories({ activeOnly: true }),
    listMenuItems({ activeOnly: true })
  ]);

  const slugParams = new Set<string>();

  for (const category of categories) {
    for (const alias of getCategorySlugAliases(category)) {
      slugParams.add(alias);
    }
  }

  for (const item of items) {
    for (const alias of getMenuItemSlugAliases(item)) {
      slugParams.add(alias);
    }
  }

  return [...slugParams].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: MenuSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const normalized = normalizeMenuSlugParam(slug);

  const category = await getCachedMenuCategoryBySlug(normalized);
  if (category) {
    const [seoContent, localizedCategory] = await Promise.all([
      getCachedResolvedSeoPageContent(locale, "menu"),
      localizeCategory(category, locale)
    ]);
    const categorySeo = getResolvedCategorySeo(seoContent, category.id);
    const introLead = splitParagraphs(categorySeo.introduction)[0] ?? "";

    return getMenuCategoryPageMetadata(locale, {
      name: getLocalizedCategoryName(localizedCategory, locale),
      slug: resolveCategorySlug(category),
      description: localizedCategory.displayDescription ?? category.description,
      seoIntro: introLead,
      metaTitle: categorySeo.metaTitle,
      metaDescription: categorySeo.metaDescription
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

  const localizedItem = await localizeMenuItem(item, locale);
  const localized = getLocalizedMenuItem(localizedItem, locale);
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

    const [groups, orderLinks, seoContent, messages] = await Promise.all([
      getCachedMenuForDisplay(),
      getCachedActiveOrderLinks(),
      getCachedResolvedSeoPageContent(locale, "menu"),
      getLocalizedMessages(locale)
    ]);
    const localizedGroups = await localizeMenuGroups(groups, locale);
    const group = localizedGroups.find((entry) => entry.id === category.id);
    if (!group) {
      notFound();
    }

    const rawCategorySeo = getResolvedCategorySeo(seoContent, category.id);
    const categorySeo = await localizeResolvedCategorySeoContent(rawCategorySeo, locale);
    const { pickupUrl, deliveryUrl } = resolveMenuOrderUrls(orderLinks);
    const categoryName = getLocalizedCategoryName(group, locale);

    return (
      <>
        <JsonLd
          data={buildCategoryBreadcrumbJsonLd({
            categoryName,
            categorySlug: resolvedSlug,
            locale,
            messages
          })}
        />
        <main id="main-content" className="menu-page">
          <div className="menu-page-inner">
            <MenuCategoryView
              group={group}
              allGroups={localizedGroups}
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

  const [orderLinks, categories, groups, messages] = await Promise.all([
    getCachedActiveOrderLinks(),
    getCachedMenuCategories(),
    getCachedMenuForDisplay(),
    getLocalizedMessages(locale)
  ]);
  const itemCategory = categories.find((entry) => entry.id === item.categoryId);
  const [localizedItem, localizedCategory, localizedRelatedItems] = await Promise.all([
    localizeMenuItem(item, locale),
    itemCategory ? localizeCategory(itemCategory, locale) : Promise.resolve(undefined),
    localizeMenuItems(
      groups.find((group) => group.id === item.categoryId)?.items.filter(
        (entry) => entry.id !== item.id && entry.isActive
      ) ?? [],
      locale
    )
  ]);
  const categoryName = localizedCategory
    ? getLocalizedCategoryName(localizedCategory, locale)
    : undefined;
  const categorySlug = itemCategory ? resolveCategorySlug(itemCategory) : undefined;
  const { pickupUrl, deliveryUrl } = resolveMenuOrderUrls(orderLinks);

  return (
    <>
      <JsonLd data={buildProductJsonLd(localizedItem, { slug: resolvedSlug, locale })} />
      <JsonLd
        data={buildProductBreadcrumbJsonLd(localizedItem, {
          slug: resolvedSlug,
          locale,
          categoryName,
          categorySlug,
          messages
        })}
      />
      <main id="main-content" className="menu-item-detail-page">
        <MenuItemDetailView
          item={localizedItem}
          category={localizedCategory}
          relatedItems={localizedRelatedItems}
          pickupUrl={pickupUrl}
          deliveryUrl={deliveryUrl}
        />
      </main>
      <SiteFooter />
    </>
  );
}
