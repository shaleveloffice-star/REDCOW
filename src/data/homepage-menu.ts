export const HOMEPAGE_MENU_ITEM_IDS = [
  "item-nb-classic",
  "item-fries",
  "item-crispy-chicken",
  "item-nuggets"
] as const;

export type HomepageMenuItemId = (typeof HOMEPAGE_MENU_ITEM_IDS)[number];
