"use client";

import Link from "next/link";

import { getLocalizedCategoryName } from "@/i18n/category-translations";
import { getMenuCategoryHref } from "@/lib/menu/category-slug";
import type { MenuCategory } from "@/types/content";

type MenuFiltersProps = {
  groups: MenuCategory[];
  activeCategoryId: string;
  filterAllLabel: string;
  ariaLabel: string;
  locale: "he" | "en" | "fr";
};

export function MenuFilters({
  groups,
  activeCategoryId,
  filterAllLabel,
  ariaLabel,
  locale
}: MenuFiltersProps) {
  return (
    <div className="menu-bleecker-filters" role="group" aria-label={ariaLabel}>
      <Link
        href="/menu"
        aria-current={activeCategoryId === "all" ? "page" : undefined}
        className={`menu-bleecker-filter${activeCategoryId === "all" ? " is-active" : ""}`}
      >
        {filterAllLabel}
      </Link>
      {groups.map((group) => (
        <Link
          key={group.id}
          href={getMenuCategoryHref(group)}
          aria-current={activeCategoryId === group.id ? "page" : undefined}
          className={`menu-bleecker-filter${activeCategoryId === group.id ? " is-active" : ""}`}
        >
          {getLocalizedCategoryName(group, locale)}
        </Link>
      ))}
    </div>
  );
}
