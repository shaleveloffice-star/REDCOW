"use client";

import Link from "next/link";

import { FullMenuView } from "@/components/features/menu/full-menu-view";
import { useTranslations } from "@/components/providers/locale-provider";
import type { MenuCategory, MenuItem } from "@/types/content";

type MenuPageViewProps = {
  groups: Array<MenuCategory & { items: MenuItem[] }>;
};

export function MenuPageView({ groups }: MenuPageViewProps) {
  const t = useTranslations();

  return (
    <>
      <header className="menu-page-intro menu-highlights-shell">
        <p className="menu-highlights-kicker">Menu</p>
        <h1 className="menu-page-hero-title">{t.menuShowcase.title}</h1>
        <p className="menu-page-lede">{t.menuShowcase.lead}</p>
        <Link className="menu-showcase-button menu-page-back" href="/#menu">
          {t.hero.menuCta}
        </Link>
      </header>
      <FullMenuView groups={groups} />
    </>
  );
}
