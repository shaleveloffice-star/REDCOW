"use client";

import Link from "next/link";

import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { MenuCategorySeoBlock } from "@/components/features/menu/menu-category-seo-block";
import { MenuFilters } from "@/components/features/menu/menu-filters";
import { isBurgersCategory, MenuItemsGrid } from "@/components/features/menu/menu-items-grid";
import { MenuOrderCtas } from "@/components/features/menu/menu-order-ctas";
import { SeoContentBody } from "@/components/shared/seo-content-body";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { getLocalizedCategoryName } from "@/i18n/category-translations";
import { getMenuCategoryHref } from "@/lib/menu/category-slug";
import type { MenuCategory, MenuItem } from "@/types/content";
import type { ResolvedCategorySeoContent } from "@/types/seo-content";

type MenuGroup = MenuCategory & { items: MenuItem[] };

type MenuCategoryViewProps = {
  group: MenuGroup;
  allGroups: MenuGroup[];
  categorySeo: ResolvedCategorySeoContent;
  pickupUrl: string;
  deliveryUrl: string;
};

export function MenuCategoryView({
  group,
  allGroups,
  categorySeo,
  pickupUrl,
  deliveryUrl
}: MenuCategoryViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const categoryName = getLocalizedCategoryName(group, locale);
  const relatedGroups = allGroups.filter((entry) => entry.id !== group.id && entry.isActive);

  return (
    <div className="menu-bleecker menu-bleecker--category">
      <div className="menu-bleecker-toolbar menu-bleecker-toolbar--category">
        <MenuBreadcrumbs
          items={[
            { label: t.nav.home, href: "/" },
            { label: t.nav.menu, href: "/menu" },
            { label: categoryName }
          ]}
        />
        <h1 className="menu-bleecker-title menu-bleecker-title--category">{categoryName}</h1>
      </div>

      <MenuFilters
        groups={allGroups}
        activeCategoryId={group.id}
        filterAllLabel={t.menuPage.filterAll}
        ariaLabel={t.menuPage.title}
        locale={locale}
      />

      {categorySeo.introduction.trim() ? (
        <SeoContentBody
          text={categorySeo.introduction}
          className="menu-bleecker-seo-intro menu-bleecker-category-intro"
          paragraphClassName="menu-bleecker-category-intro-p"
        />
      ) : null}

      {group.items.length === 0 ? (
        <p className="menu-bleecker-empty">{t.menuPage.empty}</p>
      ) : (
        <div className="menu-bleecker-sections">
          <section className="menu-bleecker-category" aria-labelledby={`menu-category-${group.id}`}>
            <MenuItemsGrid items={group.items} large={isBurgersCategory(group)} />
          </section>
        </div>
      )}

      <MenuCategorySeoBlock content={categorySeo} categoryId={group.id} />

      {relatedGroups.length > 0 ? (
        <nav className="menu-bleecker-related" aria-label={t.menuPage.relatedCategories}>
          <h2 className="menu-bleecker-related-title">{t.menuPage.relatedCategories}</h2>
          <ul className="menu-bleecker-related-list">
            {relatedGroups.map((entry) => (
              <li key={entry.id}>
                <Link href={getMenuCategoryHref(entry)} className="menu-bleecker-related-link">
                  {getLocalizedCategoryName(entry, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <MenuOrderCtas pickupUrl={pickupUrl} deliveryUrl={deliveryUrl} />
    </div>
  );
}
