import type { MetadataRoute } from "next";

import { resolveMenuItemSlug } from "@/lib/menu/product-slug";
import { resolveCategorySlug } from "@/lib/menu/category-slug";
import { resolveStorySlug } from "@/lib/stories/story-slug";
import { SITE_URL } from "@/lib/seo";
import { listMenuItems, listMenuCategories } from "@/services/menu.service";
import { listBrandStories } from "@/services/stories.service";
import { isStoryInMagazine } from "@/lib/stories/story-slug";

export const dynamic = "force-dynamic";

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
  { path: "/kosher", changeFrequency: "monthly", priority: 0.7 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/accessibility", changeFrequency: "yearly", priority: 0.3 }
];

function modificationDate(value: string): { lastModified?: Date } {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? { lastModified: new Date(timestamp) } : {};
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const staticEntries = PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency,
    priority
  }));

  let menuEntries: MetadataRoute.Sitemap = [];
  try {
    const [items, categories] = await Promise.all([
      listMenuItems({ activeOnly: true }),
      listMenuCategories({ activeOnly: true })
    ]);
    const activeIds = new Set(categories.map(category => category.id));
    const itemEntries = items.filter(item => activeIds.has(item.categoryId)).map((item) => ({
      url: `${SITE_URL}/menu/${resolveMenuItemSlug(item)}`,
      ...modificationDate(item.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }));
    const categoryEntries = categories.map((category) => ({
      url: `${SITE_URL}/menu/${resolveCategorySlug(category)}`,
      ...modificationDate(category.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.85
    }));
    menuEntries = [...categoryEntries, ...itemEntries];
  } catch (error) {
    throw new Error("Sitemap menu data is unavailable", { cause: error });
  }

  let storyEntries: MetadataRoute.Sitemap = [];
  try {
    const stories = await listBrandStories({ activeOnly: true });
    const magazine = stories.filter(isStoryInMagazine);
    if (magazine.length > 0) {
      storyEntries.push({
        url: `${SITE_URL}/stories`,
        ...modificationDate(magazine.map(story => story.updatedAt).filter(value => Number.isFinite(Date.parse(value))).sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? ""),
        changeFrequency: "weekly",
        priority: 0.75
      });
    }
    storyEntries.push(
      ...stories.map((story) => ({
        url: `${SITE_URL}/stories/${resolveStorySlug(story)}`,
        ...modificationDate(story.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7
      }))
    );
  } catch (error) {
    throw new Error("Sitemap story data is unavailable", { cause: error });
  }

  return [...new Map([...staticEntries, ...menuEntries, ...storyEntries].map(entry => [entry.url, entry])).values()];
}
