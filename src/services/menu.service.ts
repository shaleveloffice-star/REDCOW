import { getMenuItemSlugAliases } from "@/lib/menu/product-slug";
import { getCategorySlugAliases } from "@/lib/menu/category-slug";
import {
  getHomepageMenuShowcaseConfig,
  saveHomepageMenuShowcaseConfig
} from "@/repositories/homepage-menu-showcase.repository";
import {
  deleteMenuCategory,
  deleteMenuItem,
  getMenuCategories,
  getMenuItemById,
  getMenuItems,
  saveMenuCategory,
  saveMenuItem
} from "@/repositories/menu.repository";
import type { MenuCategory, MenuItem } from "@/types/content";

const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

export async function listMenuItems(options: { activeOnly?: boolean } = {}): Promise<MenuItem[]> {
  const items = await getMenuItems();
  return items
    .filter((item) => (options.activeOnly ? item.isActive : true))
    .sort(bySortOrder);
}

export async function listMenuCategories(
  options: { activeOnly?: boolean } = {}
): Promise<MenuCategory[]> {
  const categories = await getMenuCategories();
  return categories
    .filter((category) => (options.activeOnly ? category.isActive : true))
    .sort(bySortOrder);
}

export async function getMenuForDisplay() {
  const [items, categories] = await Promise.all([
    listMenuItems({ activeOnly: true }),
    listMenuCategories({ activeOnly: true })
  ]);

  return categories.map((category) => ({
    ...category,
    items: items.filter((item) => item.categoryId === category.id)
  }));
}

export async function getHomepageMenuShowcase(): Promise<MenuItem[]> {
  const MAX_SHOWCASE = 8;

  try {
    const [activeItems, config] = await Promise.all([
      listMenuItems({ activeOnly: true }),
      getHomepageMenuShowcaseConfig()
    ]);

    if (activeItems.length === 0) {
      return [];
    }

    const activeById = new Map(activeItems.map((item) => [item.id, item]));
    const curatedIds =
      config.itemIds.length > 0
        ? config.itemIds
        : activeItems.slice(0, MAX_SHOWCASE).map((item) => item.id);

    const curated = curatedIds
      .map((id) => activeById.get(id))
      .filter((item): item is MenuItem => Boolean(item));

    if (curated.length > 0) {
      return curated;
    }

    return activeItems.slice(0, MAX_SHOWCASE);
  } catch (error) {
    console.error("[menu.service] getHomepageMenuShowcase failed", error);
    try {
      const activeItems = await listMenuItems({ activeOnly: true });
      return activeItems.slice(0, MAX_SHOWCASE);
    } catch {
      return [];
    }
  }
}

export async function getHomepageMenuShowcaseSelection(): Promise<{
  itemIds: string[];
  isConfigured: boolean;
}> {
  const [config, showcase] = await Promise.all([
    getHomepageMenuShowcaseConfig(),
    getHomepageMenuShowcase()
  ]);

  return {
    itemIds: config.itemIds.length > 0 ? config.itemIds : showcase.map((item) => item.id),
    isConfigured: config.itemIds.length > 0
  };
}

export async function updateHomepageMenuShowcase(itemIds: string[]) {
  return saveHomepageMenuShowcaseConfig(itemIds);
}

export async function getMenuItemForDisplay(id: string): Promise<MenuItem | null> {
  const item = await getMenuItemById(id);
  if (!item || !item.isActive) {
    return null;
  }
  return item;
}

function normalizeSlugParam(slug: string): string {
  let value = slug.trim();

  try {
    while (/%[0-9A-Fa-f]{2}/.test(value)) {
      const decoded = decodeURIComponent(value);
      if (decoded === value) break;
      value = decoded;
    }
  } catch {
    // Keep the raw slug when decoding fails.
  }

  return value.toLowerCase();
}

export async function getMenuItemBySlugForDisplay(slug: string): Promise<MenuItem | null> {
  const normalized = normalizeSlugParam(slug);
  if (!normalized) return null;

  const items = await listMenuItems({ activeOnly: false });
  const match = items.find((item) => {
    const aliases = getMenuItemSlugAliases(item);
    return aliases.includes(normalized);
  });

  if (!match || !match.isActive) {
    return null;
  }
  return match;
}

export async function getMenuCategoryBySlugForDisplay(slug: string): Promise<MenuCategory | null> {
  const normalized = normalizeSlugParam(slug);
  if (!normalized) return null;

  const categories = await listMenuCategories({ activeOnly: true });
  const match = categories.find((category) => getCategorySlugAliases(category).includes(normalized));

  return match ?? null;
}

export async function upsertMenuItem(input: MenuItem): Promise<MenuItem> {
  return saveMenuItem({ ...input, updatedAt: new Date().toISOString() });
}

export async function upsertMenuCategory(input: MenuCategory): Promise<MenuCategory> {
  return saveMenuCategory({ ...input, updatedAt: new Date().toISOString() });
}

export async function removeMenuItem(id: string): Promise<boolean> {
  return deleteMenuItem(id);
}

export async function removeMenuCategory(id: string): Promise<boolean> {
  return deleteMenuCategory(id);
}
