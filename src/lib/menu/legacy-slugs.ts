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
  "item-nb-burger-klasi": ["hamburger-nb-classic", "hamburger-so-classic"],
  "item-nb-burger-kamhin": ["hamburger-nb-truffle", "so-truffle-burger"],
  // Production CMS continues the house burger as so-house-burger (may use a new document id).
  "item-nb-burger-konfi": ["hamburger-nb-confit", "so-house-burger"],
  "item-nb-burger-vegan": ["hamburger-nb-vegan"],
  "item-meal-nb-klasi": ["nb-classic-meal", "so-classic-meal"],
  "item-meal-nb-kamhin": ["nb-truffle-meal", "so-truffle-burger-meal"],
  "item-side-wings": ["chili-chicken-wings", "wings", "wings-10"],
  "item-side-nuggets-4": ["4-piece-nuggets", "nuggets-4"],
  "item-salad-green": ["green-salad"],
  "item-salad-caesar-small": ["caesar-salad-small"],
  "item-salad-caesar-large": ["caesar-salad-large"]
};

function knownAliases(
  mappings: Readonly<Record<string, readonly string[]>>,
  id: string,
  slug: string | undefined,
  prefix: string
): string[] {
  const current = slug?.trim().toLowerCase();
  // Imported production records may have different IDs. Only recognize an exact
  // slug from a documented equivalence group; never guess from names or substrings.
  const aliases = Object.entries(mappings).flatMap(([legacyId, slugs]) => {
    const group = [legacyId.replace(prefix, ""), ...slugs];
    return legacyId === id || (current && group.includes(current)) ? group : [];
  });
  return [...new Set(aliases)];
}

export function getCategoryLegacySlugs(categoryId: string, slug?: string): string[] {
  return knownAliases(CATEGORY_LEGACY_SLUGS_BY_ID, categoryId, slug, "cat-");
}

export function getMenuItemLegacySlugs(itemId: string, slug?: string): string[] {
  return knownAliases(MENU_ITEM_LEGACY_SLUGS_BY_ID, itemId, slug, "item-");
}
