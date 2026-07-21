import type { MenuItem } from "@/types/content";

import type { Locale } from "./config";

type MenuItemTranslation = {
  name: string;
  description: string;
  longDescription?: string;
  detailNotes?: string[];
};

type MenuItemTranslations = Partial<Record<Exclude<Locale, "he">, MenuItemTranslation>>;

const MENU_ITEM_TRANSLATIONS: Record<string, MenuItemTranslations> = {
  "item-nb-classic": {
    en: {
      name: "NB Classic",
      description: "Beef patty, lettuce, tomato, red onion, and house sauce.",
      longDescription:
        "Our signature classic — freshly ground beef on the plancha, layered with crisp vegetables and house sauce.",
      detailNotes: [
        "We use American cheese because it melts better than other cheeses. It's the best.",
        "Our beef is precious to us. That's why we use a special blend that we dry-age in-house."
      ]
    },
    fr: {
      name: "NB Classic",
      description: "Steak haché, laitue, tomate, oignon rouge et sauce maison.",
      longDescription:
        "Notre classique signature — bœuf fraîchement haché sur la plancha, avec légumes croquants et sauce maison.",
      detailNotes: [
        "Nous utilisons du fromage américain car il fond mieux que les autres. C’est le meilleur.",
        "Notre bœuf est précieux. C’est pourquoi nous utilisons un mélange spécial affiné sur place."
      ]
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

export type LocalizedMenuItem = {
  name: string;
  description: string;
  longDescription: string;
  detailNotes: string[];
  imageAlt: string;
};

export function getLocalizedMenuItem(item: MenuItem, locale: Locale): LocalizedMenuItem {
  const hebrewNotes = item.detailNotes?.filter((note) => note.trim().length > 0) ?? [];
  const hebrewLong = item.longDescription?.trim() ?? "";
  const fallbackAlt = item.imageAlt?.trim() || item.name;

  if (locale === "he") {
    return {
      name: item.name,
      description: item.description,
      longDescription: hebrewLong,
      detailNotes: hebrewNotes,
      imageAlt: fallbackAlt
    };
  }

  const translation = MENU_ITEM_TRANSLATIONS[item.id]?.[locale];

  return {
    name: translation?.name ?? item.name,
    description: translation?.description ?? item.description,
    longDescription: translation?.longDescription?.trim() || hebrewLong,
    detailNotes:
      translation?.detailNotes?.filter((note) => note.trim().length > 0) ?? hebrewNotes,
    imageAlt: fallbackAlt
  };
}

/** Unique non-empty gallery URLs for optional product galleries. */
export function getMenuItemGalleryUrls(item: MenuItem): string[] {
  const raw = [item.imageUrl, ...(item.galleryUrls ?? [])]
    .map((url) => url.trim())
    .filter(Boolean);
  return [...new Set(raw)];
}
