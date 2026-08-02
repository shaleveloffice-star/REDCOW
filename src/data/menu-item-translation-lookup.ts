import type { Locale } from "@/i18n/config";
import {
  MENU_ITEM_TRANSLATIONS,
  type MenuItemTranslationEntry
} from "@/data/menu-item-translations";

type TargetLocale = Exclude<Locale, "he">;
type MenuItemTranslationFields = MenuItemTranslationEntry[TargetLocale];

/** Slug → canonical menu item id (covers production aliases and legacy URLs). */
const SLUG_TO_ITEM_ID: Record<string, string> = {
  "nb-burger-klasi": "item-nb-burger-klasi",
  "nb-burger-kamhin": "item-nb-burger-kamhin",
  "nb-burger-konfi": "item-nb-burger-konfi",
  "nb-burger-vegan": "item-nb-burger-vegan",
  "meal-nb-klasi": "item-meal-nb-klasi",
  "meal-nb-kamhin": "item-meal-nb-kamhin",
  chips: "item-side-fries",
  "home-fries": "item-side-home-fries",
  wings: "item-side-wings",
  "nuggets-4": "item-side-nuggets-4",
  "nuggets-7": "item-side-nuggets-7",
  "salad-green": "item-salad-green",
  "salad-caesar-small": "item-salad-caesar-small",
  "salad-caesar-large": "item-salad-caesar-large",
  "aioli-konfi": "item-sauce-aioli-konfi",
  "aioli-honey-mustard": "item-sauce-aioli-honey-mustard",
  "aioli-kamhin": "item-sauce-aioli-kamhin",
  "aioli-mint": "item-sauce-aioli-mint",
  "aioli-chipotle": "item-sauce-aioli-chipotle",
  ketchup: "item-sauce-ketchup",
  mayo: "item-sauce-mayo",
  "mineral-water": "item-drink-water",
  soda: "item-drink-soda",
  lemonade: "item-drink-lemonade",
  cola: "item-drink-cola",
  "cola-zero": "item-drink-cola-zero",
  sprite: "item-drink-sprite",
  "sprite-zero": "item-drink-sprite-zero",
  fanta: "item-drink-fanta",
  "grape-drink": "item-drink-grape",
  fuzetea: "item-drink-fuzetea",
  "beer-corona": "item-beer-corona",
  "beer-stella": "item-beer-stella",
  "beer-heineken": "item-beer-heineken",
  "beer-goldstar": "item-beer-goldstar",
  "hamburger-nb-classic": "item-nb-burger-klasi",
  "hamburger-nb-truffle": "item-nb-burger-kamhin",
  "hamburger-nb-confit": "item-nb-burger-konfi",
  "hamburger-nb-vegan": "item-nb-burger-vegan",
  "nb-classic-meal": "item-meal-nb-klasi",
  "nb-truffle-meal": "item-meal-nb-kamhin",
  "chili-chicken-wings": "item-side-wings",
  "4-piece-nuggets": "item-side-nuggets-4",
  "caesar-salad-small": "item-salad-caesar-small",
  "caesar-salad-large": "item-salad-caesar-large",
  "green-salad": "item-salad-green"
};

function resolveTranslationItemId(item: { id: string; slug?: string }): string {
  const id = String(item.id ?? "").trim();
  if (id && MENU_ITEM_TRANSLATIONS[id]) {
    return id;
  }

  const slug = String(item.slug ?? "").trim().toLowerCase();
  if (slug && SLUG_TO_ITEM_ID[slug]) {
    return SLUG_TO_ITEM_ID[slug];
  }

  return id;
}

export function getMenuItemTranslationFields(
  item: { id: string; slug?: string },
  locale: TargetLocale
): MenuItemTranslationFields | undefined {
  const itemId = resolveTranslationItemId(item);
  return MENU_ITEM_TRANSLATIONS[itemId]?.[locale];
}
