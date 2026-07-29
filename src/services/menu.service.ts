import { mockMenuItems } from "@/data/mock/menu.mock";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getMenuItemSlugAliases } from "@/lib/menu/product-slug";
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
  const [activeItems, allItems, config] = await Promise.all([
    listMenuItems({ activeOnly: true }),
    listMenuItems({ activeOnly: false }),
    getHomepageMenuShowcaseConfig()
  ]);
  const activeById = new Map(activeItems.map((item) => [item.id, item]));
  const allById = new Map(allItems.map((item) => [item.id, item]));
  // Mock seed only when Firebase is not configured — never silent fallback in production.
  const seedById = isFirebaseConfigured()
    ? new Map<string, MenuItem>()
    : new Map(mockMenuItems.map((item) => [item.id, item]));

  const curatedIds =
    config.itemIds.length > 0 ? config.itemIds : activeItems.slice(0, 8).map((item) => item.id);

  const curated = curatedIds.flatMap((id) => {
    const activeItem = activeById.get(id);
    if (activeItem) {
      return [activeItem];
    }

    if (allById.has(id)) {
      return [];
    }

    const seedItem = seedById.get(id);
    return seedItem?.isActive ? [seedItem] : [];
  });

  if (curated.length > 0) {
    return curated;
  }

  // Fallback: show the first active dishes so homepage section 2 is never empty black.
  const MAX_SHOWCASE = 8;
  return activeItems.slice(0, MAX_SHOWCASE);
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
