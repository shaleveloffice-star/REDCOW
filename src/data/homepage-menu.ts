/** Fallback when no homepage showcase config is saved yet. */
export const DEFAULT_HOMEPAGE_MENU_ITEM_IDS = [
  "item-nb-classic",
  "item-fries",
  "item-crispy-chicken",
  "item-nuggets"
] as const;

export type HomepageMenuItemId = (typeof DEFAULT_HOMEPAGE_MENU_ITEM_IDS)[number];
