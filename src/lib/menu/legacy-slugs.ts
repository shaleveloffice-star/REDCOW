/**
 * Legacy public slugs from older menu URLs (Firestore / sitemap / bookmarks).
 * Kept in one place so /menu/[slug] resolves and redirects to the canonical slug.
 */

/** Extra slug aliases per category id (in addition to slug + id-derived aliases). */
export const CATEGORY_LEGACY_SLUGS_BY_ID: Readonly<Record<string, readonly string[]>> = {
  "cat-sides": ["extras"],
  "cat-salads": ["salad"],
  "cat-soft-drinks": ["drinks"]
};

/** Extra slug aliases per menu item id (production URLs, old naming, etc.). */
export const MENU_ITEM_LEGACY_SLUGS_BY_ID: Readonly<Record<string, readonly string[]>> = {
  "item-nb-burger-klasi": ["hamburger-nb-classic"],
  "item-nb-burger-kamhin": ["hamburger-nb-truffle"],
  "item-nb-burger-konfi": ["hamburger-nb-confit"],
  "item-nb-burger-vegan": ["hamburger-nb-vegan"],
  "item-meal-nb-klasi": ["nb-classic-meal"],
  "item-meal-nb-kamhin": ["nb-truffle-meal"],
  "item-side-wings": ["chili-chicken-wings"],
  "item-side-nuggets-4": ["4-piece-nuggets"],
  "item-salad-green": ["green-salad"],
  "item-salad-caesar-small": ["caesar-salad-small"],
  "item-salad-caesar-large": ["caesar-salad-large"]
};

export function getCategoryLegacySlugs(categoryId: string): string[] {
  return [...(CATEGORY_LEGACY_SLUGS_BY_ID[categoryId] ?? [])];
}

export function getMenuItemLegacySlugs(itemId: string): string[] {
  return [...(MENU_ITEM_LEGACY_SLUGS_BY_ID[itemId] ?? [])];
}
