import type { MetadataRoute } from "next";

import { resolveMenuItemSlug } from "@/lib/menu/product-slug";
import { resolveCategorySlug } from "@/lib/menu/category-slug";
import { SITE_URL } from "@/lib/seo";
import { listMenuItems, listMenuCategories } from "@/services/menu.service";

type SitemapEntryInput = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const PUBLIC_ROUTES: SitemapEntryInput[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/menu", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/locations", changeFrequency: "weekly", priority: 0.8 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries = PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority
  }));

  let menuEntries: MetadataRoute.Sitemap = [];
  try {
    const [items, categories] = await Promise.all([
      listMenuItems({ activeOnly: true }),
      listMenuCategories({ activeOnly: true })
    ]);
    const itemEntries = items.map((item) => ({
      url: `${SITE_URL}/menu/${resolveMenuItemSlug(item)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }));
    const categoryEntries = categories.map((category) => ({
      url: `${SITE_URL}/menu/${resolveCategorySlug(category)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85
    }));
    menuEntries = [...categoryEntries, ...itemEntries];
  } catch {
    menuEntries = [];
  }

  return [...staticEntries, ...menuEntries];
}
