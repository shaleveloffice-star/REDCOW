import type { MenuItem } from "@/types/content";

import type { Locale } from "./config";

type MenuItemTranslation = {
  name: string;
  description: string;
};

type MenuItemTranslations = Partial<Record<Exclude<Locale, "he">, MenuItemTranslation>>;

const MENU_ITEM_TRANSLATIONS: Record<string, MenuItemTranslations> = {
  "item-nb-classic": {
    en: {
      name: "NB Classic",
      description: "Beef patty, lettuce, tomato, red onion, and house sauce."
    },
    fr: {
      name: "NB Classic",
      description: "Steak haché, laitue, tomate, oignon rouge et sauce maison."
    }
  },
  "item-fries": {
    en: {
      name: "NB Fries",
      description: "Crispy fries with house seasoning."
    },
    fr: {
      name: "Frites NB",
      description: "Frites croustillantes avec assaisonnement maison."
    }
  },
  "item-crispy-chicken": {
    en: {
      name: "Crispy Chicken",
      description: "Crispy chicken schnitzel, lettuce, lemon mayo, and fresh challah."
    },
    fr: {
      name: "Crispy Chicken",
      description: "Escalope de poulet croustillante, laitue, mayo citron et challah frais."
    }
  },
  "item-nuggets": {
    en: {
      name: "Nuggets",
      description: "Crispy chicken nuggets, served with sauce of your choice."
    },
    fr: {
      name: "Nuggets",
      description: "Nuggets de poulet croustillants, servis avec sauce au choix."
    }
  }
};

export function getLocalizedMenuItem(
  item: MenuItem,
  locale: Locale
): { name: string; description: string } {
  if (locale === "he") {
    return { name: item.name, description: item.description };
  }

  const translation = MENU_ITEM_TRANSLATIONS[item.id]?.[locale];

  return {
    name: translation?.name ?? item.name,
    description: translation?.description ?? item.description
  };
}
