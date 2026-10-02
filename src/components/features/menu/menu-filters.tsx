"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";

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

function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Category switches skip the global page-transition overlay (data-no-transition): the current grid
 * stays visible until the next category is ready, so already-cached dish images appear instantly
 * instead of being hidden behind a loading screen on every switch.
 */
export function MenuFilters({
  groups,
  activeCategoryId,
  filterAllLabel,
  ariaLabel,
  locale
}: MenuFiltersProps) {
  // Pending highlight is tied to the category it was clicked from, so it clears once the route changes.
  const [pending, setPending] = useState<{ from: string; id: string } | null>(null);
  const highlightedId = pending && pending.from === activeCategoryId ? pending.id : activeCategoryId;

  const onSelect = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (id !== activeCategoryId && isPlainClick(event)) setPending({ from: activeCategoryId, id });
  };

  return (
    <div className="menu-bleecker-filters" role="group" aria-label={ariaLabel}>
      <Link
        href="/menu"
        data-no-transition="true"
        onClick={onSelect("all")}
        aria-current={activeCategoryId === "all" ? "page" : undefined}
        className={`menu-bleecker-filter${highlightedId === "all" ? " is-active" : ""}`}
      >
        {filterAllLabel}
      </Link>
      {groups.map((group) => (
        <Link
          key={group.id}
          href={getMenuCategoryHref(group)}
          data-no-transition="true"
          onClick={onSelect(group.id)}
          aria-current={activeCategoryId === group.id ? "page" : undefined}
          className={`menu-bleecker-filter${highlightedId === group.id ? " is-active" : ""}`}
        >
          {getLocalizedCategoryName(group, locale)}
        </Link>
      ))}
    </div>
  );
}
