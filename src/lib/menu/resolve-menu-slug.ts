import type { MenuCategory, MenuItem } from "@/types/content";

import {
  getMenuCategoryBySlugForDisplay,
  getMenuItemBySlugForDisplay
} from "@/services/menu.service";

export type ResolvedMenuSlug =
  | { type: "category"; category: MenuCategory }
  | { type: "item"; item: MenuItem };

/** Category slugs take precedence over item slugs at /menu/[slug]. */
export async function resolveMenuSlugForDisplay(slug: string): Promise<ResolvedMenuSlug | null> {
  const category = await getMenuCategoryBySlugForDisplay(slug);
  if (category) {
    return { type: "category", category };
  }

  const item = await getMenuItemBySlugForDisplay(slug);
  if (item) {
    return { type: "item", item };
  }

  return null;
}
