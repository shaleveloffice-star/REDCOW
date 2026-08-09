import { BUSINESS } from "@/data/business";
import type { Locale } from "@/i18n/config";

export const DECORATIVE_IMAGE_ALT = "" as const;
export const BRAND_NAME = BUSINESS.name;

export type ImageAltKind =
  | "menu-item"
  | "menu-item-close-up"
  | "hero"
  | "restaurant"
  | "about-hero"
  | "location"
  | "branch"
  | "delivery-zone"
  | "kitchen"
  | "chef"
  | "plancha"
  | "logo"
  | "brand-story"
  | "atmosphere"
  | "atmosphere-drone"
  | "atmosphere-bun-top"
  | "atmosphere-bun-bottom"
  | "burger-layer"
  | "menu-page-hero"
  | "story";

export type BurgerLayerId =
  | "bunTop"
  | "sauce"
  | "lettuce"
  | "tomato"
  | "patty"
  | "bunBottom";

export type ResolveImageAltInput = {
  kind: ImageAltKind;
  locale?: Locale;
  /** Custom ALT from CMS / i18n — always wins when non-empty. */
  customAlt?: string | null;
  /** Display name (menu item, branch, plancha step, etc.). */
  name?: string | null;
  categoryId?: string | null;
  tags?: string[] | null;
  layerId?: BurgerLayerId | null;
  branchName?: string | null;
  city?: string | null;
  /** Primary ALT for close-up suffix generation. */
  primaryAlt?: string | null;
};

type MenuCategoryKey =
  | "burgers"
  | "meals"
  | "sides"
  | "salads"
  | "sauces"
  | "soft-drinks"
  | "beers"
  | "unknown";

const CATEGORY_ID_MAP: Record<string, MenuCategoryKey> = {
  "cat-burgers": "burgers",
  "cat-meals": "meals",
  "cat-sides": "sides",
  "cat-salads": "salads",
  "cat-sauces": "sauces",
  "cat-soft-drinks": "soft-drinks",
  "cat-beers": "beers"
};

const BURGER_LAYER_LABELS: Record<Locale, Record<BurgerLayerId, string>> = {
  he: {
    bunTop: "לחמנייה עליונה",
    sauce: "רוטב",
    lettuce: "חסה",
    tomato: "עגבנייה",
    patty: "קציצה",
    bunBottom: "לחמנייה תחתונה"
  },
  en: {
    bunTop: "Top bun",
    sauce: "Sauce",
    lettuce: "Lettuce",
    tomato: "Tomato",
    patty: "Patty",
    bunBottom: "Bottom bun"
  },
  fr: {
    bunTop: "Pain du haut",
    sauce: "Sauce",
    lettuce: "Laitue",
    tomato: "Tomate",
    patty: "Steak haché",
    bunBottom: "Pain du bas"
  }
};

function trim(value?: string | null): string {
  return String(value ?? "").trim();
}

function withBrand(name: string, locale: Locale): string {
  const label = trim(name);
  if (!label) return BRAND_NAME;

  if (locale === "he") {
    return `${label} של ${BRAND_NAME}`;
  }
  if (locale === "fr") {
    return `${label} — ${BRAND_NAME}`;
  }
  return `${label} from ${BRAND_NAME}`;
}

function resolveCategoryKey(categoryId?: string | null): MenuCategoryKey {
  const id = trim(categoryId);
  return CATEGORY_ID_MAP[id] ?? "unknown";
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ");
}

function detectSideSubtype(name: string): "fries" | "home-fries" | "wings" | "nuggets" | null {
  const normalized = normalizeName(name);

  if (/נאגטס|nuggets?/.test(normalized)) return "nuggets";
  if (/כנפיים|wings?/.test(normalized)) return "wings";
  if (/הום\s*פרייז|home\s*fries?/.test(normalized)) return "home-fries";
  if (/צ'?יפס|fries?/.test(normalized)) return "fries";

  return null;
}

function generateMenuItemAlt(
  name: string,
  locale: Locale,
  categoryId?: string | null,
  tags?: string[] | null
): string {
  const label = trim(name) || BRAND_NAME;
  const category = resolveCategoryKey(categoryId);
  const tagText = (tags ?? []).join(" ").toLowerCase();

  if (category === "soft-drinks" || category === "beers") {
    return label;
  }

  if (category === "burgers" || /המבורגר|burger|smash/i.test(label) || /המבורגר|burger/i.test(tagText)) {
    if (/של\s+NB BURGER|from NB BURGER|— NB BURGER/i.test(label)) return label;
    return withBrand(label, locale);
  }

  if (category === "meals" || /^ארוחת|^meal\b/i.test(label)) {
    return withBrand(label, locale);
  }

  if (category === "salads" || /^סלט|^salad/i.test(label)) {
    return withBrand(label, locale);
  }

  if (category === "sauces" || /^איולי|^רטב|^ketchup|^mayo|^sauce/i.test(label)) {
    return withBrand(label, locale);
  }

  if (category === "sides") {
    const subtype = detectSideSubtype(label);
    if (subtype === "fries") {
      return locale === "he" ? withBrand("צ'יפס", locale) : withBrand("Fries", locale);
    }
    if (subtype === "home-fries") {
      return locale === "he" ? withBrand("הום פרייז", locale) : withBrand("Home fries", locale);
    }
    if (subtype === "wings") {
      return locale === "he" ? withBrand("כנפיים", locale) : withBrand("Wings", locale);
    }
    if (subtype === "nuggets") {
      if (/^\d+\s/.test(label)) return withBrand(label, locale);
      return locale === "he" ? withBrand("נאגטס", locale) : withBrand("Nuggets", locale);
    }
    return withBrand(label, locale);
  }

  return withBrand(label, locale);
}

function closeUpSuffix(locale: Locale): string {
  if (locale === "he") return "מקרוב";
  if (locale === "fr") return "gros plan";
  return "close-up";
}

function generateByKind(input: ResolveImageAltInput): string {
  const locale = input.locale ?? "he";
  const name = trim(input.name);

  switch (input.kind) {
    case "menu-item":
      return generateMenuItemAlt(name, locale, input.categoryId, input.tags);

    case "menu-item-close-up": {
      const primary = trim(input.primaryAlt) || generateMenuItemAlt(name, locale, input.categoryId, input.tags);
      return `${primary} — ${closeUpSuffix(locale)}`;
    }

    case "hero":
      return locale === "he"
        ? `המבורגר של ${BRAND_NAME}`
        : locale === "fr"
          ? `Burger — ${BRAND_NAME}`
          : `Burger from ${BRAND_NAME}`;

    case "restaurant":
    case "about-hero":
      return locale === "he"
        ? `מסעדת ${BRAND_NAME}`
        : locale === "fr"
          ? `Restaurant ${BRAND_NAME}`
          : `${BRAND_NAME} restaurant`;

    case "location":
      return locale === "he"
        ? `חזית ${BRAND_NAME}`
        : locale === "fr"
          ? `Façade ${BRAND_NAME}`
          : `${BRAND_NAME} restaurant exterior`;

    case "branch": {
      const branch = trim(input.branchName) || name;
      return locale === "he"
        ? `סניף ${BRAND_NAME}${branch ? ` — ${branch}` : ""}`
        : locale === "fr"
          ? `Restaurant ${BRAND_NAME}${branch ? ` — ${branch}` : ""}`
          : `${BRAND_NAME} location${branch ? ` — ${branch}` : ""}`;
    }

    case "delivery-zone": {
      const city = trim(input.city) || name;
      return locale === "he"
        ? `משלוחים ל${city || "אזור השירות"}`
        : locale === "fr"
          ? `Livraison — ${city || "zone de service"}`
          : `Delivery to ${city || "service area"}`;
    }

    case "kitchen":
      return locale === "he" ? `מטבח ${BRAND_NAME}` : locale === "fr" ? `Cuisine ${BRAND_NAME}` : `${BRAND_NAME} kitchen`;

    case "chef":
      return locale === "he" ? `שף ${BRAND_NAME}` : locale === "fr" ? `Chef ${BRAND_NAME}` : `${BRAND_NAME} chef`;

    case "plancha":
      return name ? withBrand(name, locale) : locale === "he" ? `על הפלנצ׳ה — ${BRAND_NAME}` : `${BRAND_NAME} plancha`;

    case "logo":
      return locale === "he" ? `לוגו ${BRAND_NAME}` : locale === "fr" ? `Logo ${BRAND_NAME}` : `${BRAND_NAME} logo`;

    case "brand-story":
      return locale === "he"
        ? `המבורגר ${BRAND_NAME}`
        : locale === "fr"
          ? `Burger ${BRAND_NAME}`
          : `${BRAND_NAME} burger`;

    case "atmosphere":
      return locale === "he" ? `אווירה ב${BRAND_NAME}` : locale === "fr" ? `Ambiance ${BRAND_NAME}` : `${BRAND_NAME} atmosphere`;

    case "atmosphere-drone":
      return locale === "he" ? "צילום מהרחפן" : locale === "fr" ? "Vue drone" : "Drone footage";

    case "atmosphere-bun-top":
      return BURGER_LAYER_LABELS[locale].bunTop;

    case "atmosphere-bun-bottom":
      return BURGER_LAYER_LABELS[locale].bunBottom;

    case "burger-layer": {
      const layerId = input.layerId ?? "bunTop";
      return BURGER_LAYER_LABELS[locale][layerId];
    }

    case "menu-page-hero":
      return locale === "he"
        ? `מנות מתוך תפריט ${BRAND_NAME}`
        : locale === "fr"
          ? `Plats du menu ${BRAND_NAME}`
          : `Dishes from the ${BRAND_NAME} menu`;

    case "story":
      return locale === "he"
        ? `תמונה מסיפור ${BRAND_NAME}`
        : locale === "fr"
          ? `Image d'histoire ${BRAND_NAME}`
          : `${BRAND_NAME} story image`;

    default:
      return name || BRAND_NAME;
  }
}

/** Returns custom ALT when set, otherwise generates context-aware ALT text. */
export function resolveImageAlt(input: ResolveImageAltInput): string {
  const custom = trim(input.customAlt);
  if (custom) return custom;
  return generateByKind(input);
}

export type MenuItemAltInput = {
  name: string;
  imageAlt?: string | null;
  categoryId?: string | null;
  tags?: string[] | null;
};

/** Menu-specific helper used by localization and admin flows. */
export function resolveMenuItemImageAlt(
  item: MenuItemAltInput,
  locale: Locale,
  displayName?: string
): string {
  return resolveImageAlt({
    kind: "menu-item",
    locale,
    customAlt: item.imageAlt,
    name: trim(displayName) || trim(item.name),
    categoryId: item.categoryId,
    tags: item.tags
  });
}

export function resolveMenuItemCloseUpAlt(
  item: MenuItemAltInput,
  locale: Locale,
  displayName?: string
): string {
  const primaryAlt = resolveMenuItemImageAlt(item, locale, displayName);
  return resolveImageAlt({
    kind: "menu-item-close-up",
    locale,
    name: trim(displayName) || trim(item.name),
    categoryId: item.categoryId,
    tags: item.tags,
    primaryAlt
  });
}

export function isDecorativeImageAlt(alt: string): boolean {
  return alt === DECORATIVE_IMAGE_ALT;
}
