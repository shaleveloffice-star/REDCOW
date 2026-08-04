"use client";

import Link from "next/link";

import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { MenuFilters } from "@/components/features/menu/menu-filters";
import { MenuHero } from "@/components/features/menu/menu-hero";
import { isBurgersCategory, MenuItemsGrid } from "@/components/features/menu/menu-items-grid";
import {
  MenuPageSeoFooter,
  MenuPageSeoIntro,
  type MenuPageSeoContent
} from "@/components/features/menu/menu-page-seo-block";
import { MenuOrderCtas } from "@/components/features/menu/menu-order-ctas";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { getLocalizedCategoryName } from "@/i18n/category-translations";
import { getMenuCategoryHref } from "@/lib/menu/category-slug";
import type { MenuCategory, MenuItem } from "@/types/content";

type MenuGroup = MenuCategory & { items: MenuItem[] };

type MenuIndexViewProps = {
  groups: MenuGroup[];
  menuSeo: MenuPageSeoContent;
  pickupUrl: string;
  deliveryUrl: string;
};

export function MenuIndexView({ groups, menuSeo, pickupUrl, deliveryUrl }: MenuIndexViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  const visibleGroups = groups.filter((group) => group.items.length > 0);
  const isEmpty = visibleGroups.length === 0;

  return (
    <div className="menu-bleecker">
      <MenuHero heroAlt={t.menuPage.heroAlt} locale={locale} />

      <div className="menu-bleecker-toolbar menu-bleecker-toolbar--category">
        <MenuBreadcrumbs
          items={[
            { label: t.nav.home, href: "/" },
            { label: t.nav.menu }
          ]}
        />
        <h1 className="menu-bleecker-title">{t.menuPage.title}</h1>
      </div>

      <MenuFilters
        groups={groups}
        activeCategoryId="all"
        filterAllLabel={t.menuPage.filterAll}
        ariaLabel={t.menuPage.title}
        locale={locale}
      />

      <MenuPageSeoIntro content={menuSeo} />

      {isEmpty ? (
        <p className="menu-bleecker-empty">{t.menuPage.empty}</p>
      ) : (
        <div className="menu-bleecker-sections">
          {visibleGroups.map((group) => (
            <section
              key={group.id}
              className="menu-bleecker-category"
              aria-labelledby={`menu-category-${group.id}`}
            >
              <header className="menu-bleecker-category-head">
                <h2 id={`menu-category-${group.id}`} className="menu-bleecker-category-title">
                  <Link href={getMenuCategoryHref(group)} className="menu-bleecker-category-title-link">
                    {getLocalizedCategoryName(group, locale)}
                  </Link>
                </h2>
              </header>
              <MenuItemsGrid items={group.items} large={isBurgersCategory(group)} />
            </section>
          ))}
        </div>
      )}

      <MenuPageSeoFooter content={menuSeo} />

      <MenuOrderCtas pickupUrl={pickupUrl} deliveryUrl={deliveryUrl} />
    </div>
  );
}
