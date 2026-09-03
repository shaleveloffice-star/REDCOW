import "server-only";

import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { resolveCategorySlug } from "@/lib/menu/category-slug";
import { revalidatePath, updateTag } from "next/cache";
import type { SeoPageId } from "@/types/seo-content";

const PAGE_PATHS: Record<SeoPageId, string> = {
  home: "/",
  about: "/about",
  menu: "/menu",
  locations: "/locations",
  privacy: "/privacy-policy",
  terms: "/terms"
};

/** Category slugs that carry dedicated SEO intent / admin screens. */
const KNOWN_MENU_CATEGORY_SLUGS = ["burgers", "meals", "sides", "salads", "sauces", "soft-drinks", "beers"] as const;

export type SeoRevalidateOptions = {
  pageId?: SeoPageId;
  /** Public `/menu/[slug]` paths to bust after category SEO save. */
  categorySlugs?: string[];
};

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths.filter(Boolean))];
}

function menuCategoryPaths(slugs?: string[]): string[] {
  const merged = [...KNOWN_MENU_CATEGORY_SLUGS, ...(slugs ?? [])]
    .map((slug) => slug.trim().toLowerCase())
    .filter(Boolean);
  return uniquePaths(merged.map((slug) => `/menu/${slug}`));
}

/** Bust SEO data cache + targeted public routes after admin save. */
export function revalidateSeoContentCache(options?: SeoRevalidateOptions) {
  try {
    updateTag(CACHE_TAGS.seoContent);

    const paths: string[] = [];

    if (options?.pageId) {
      paths.push(PAGE_PATHS[options.pageId]);
      if (options.pageId === "menu") {
        paths.push(...menuCategoryPaths(options.categorySlugs));
      }
    } else {
      paths.push(...Object.values(PAGE_PATHS), ...menuCategoryPaths(options?.categorySlugs));
    }

    uniquePaths(paths).forEach((path) => revalidatePath(path));
  } catch {
    // ignore cache revalidation failures
  }
}

/** Resolve public slug(s) for a category id so `/menu/[slug]` can be revalidated. */
export function categorySlugsForRevalidate(
  category: { id: string; slug?: string } | null | undefined
): string[] {
  if (!category?.id) return [];
  const slug = resolveCategorySlug({
    id: category.id,
    slug: category.slug ?? ""
  });
  return slug ? [slug] : [];
}
