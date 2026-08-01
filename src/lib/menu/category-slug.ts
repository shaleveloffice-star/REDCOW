import type { MenuCategory } from "@/types/content";

import { getCategoryLegacySlugs } from "@/lib/menu/legacy-slugs";

export function resolveCategorySlug(category: Pick<MenuCategory, "id" | "slug">): string {
  const explicit = category.slug?.trim().toLowerCase();
  if (explicit) {
    return explicit;
  }

  return category.id.replace(/^cat-/, "") || category.id;
}

export function getMenuCategoryHref(category: Pick<MenuCategory, "id" | "slug">): string {
  return `/menu/${resolveCategorySlug(category)}`;
}

export function getCategorySlugAliases(category: Pick<MenuCategory, "id" | "slug">): string[] {
  const aliases = new Set<string>();
  const add = (value: string | undefined) => {
    const normalized = value?.trim().toLowerCase();
    if (normalized) {
      aliases.add(normalized);
    }
  };

  add(resolveCategorySlug(category));
  add(category.slug);
  add(category.id);
  add(category.id.replace(/^cat-/, ""));

  for (const legacy of getCategoryLegacySlugs(category.id)) {
    add(legacy);
  }

  return [...aliases];
}
