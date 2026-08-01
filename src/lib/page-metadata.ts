import type { Metadata } from "next";

import type { Locale } from "@/i18n/config";
import { buildPageMetadata } from "@/lib/seo";

type PageMetaEntry = {
  title: string;
  description: string;
};

const HOME_META: Record<Locale, PageMetaEntry> = {
  he: {
    title: "NB BURGER | המבורגר רעננה",
    description:
      "מסעדת המבורגרים NB BURGER ברעננה — המבורגרים על הפלנצ׳ה, אווירה וטעם מדויק ברחוב אחוזה 96."
  },
  en: {
    title: "NB BURGER | Kosher Burgers Raanana",
    description:
      "NB BURGER in Raanana — smash burgers on the plancha, fresh ingredients and bold flavor at Ahuzah 96."
  },
  fr: {
    title: "NB BURGER | Burgers casher Raanana",
    description:
      "NB BURGER à Raanana — burgers sur plancha, ingrédients frais et saveur intense, Ahuzah 96."
  }
};

const MENU_META: Record<Locale, PageMetaEntry> = {
  he: {
    title: "תפריט המבורגרים ברעננה | NB BURGER",
    description:
      "גלו את תפריט ההמבורגרים של NB BURGER ברעננה — המבורגרים על הפלנצ׳ה, תוספות ומנות ממסעדה כשרה ברחוב אחוזה 96."
  },
  en: {
    title: "Burger Menu Raanana | NB BURGER",
    description:
      "Explore the NB BURGER menu in Raanana — plancha burgers, sides and full meals at our kosher restaurant."
  },
  fr: {
    title: "Menu burgers Raanana | NB BURGER",
    description:
      "Découvrez le menu NB BURGER à Raanana — burgers plancha, accompagnements et formules dans un restaurant casher."
  }
};

const LOCATIONS_META: Record<Locale, PageMetaEntry> = {
  he: {
    title: "מיקום ושעות | NB BURGER רעננה",
    description: "NB BURGER ברעננה — כתובת, שעות פתיחה, ניווט ומשלוח."
  },
  en: {
    title: "Location & Hours | NB BURGER Raanana",
    description: "Find NB BURGER in Raanana — address, opening hours, directions and delivery."
  },
  fr: {
    title: "Adresse & horaires | NB BURGER Raanana",
    description: "NB BURGER à Raanana — adresse, horaires, itinéraire et livraison."
  }
};

const ABOUT_META: Record<Locale, PageMetaEntry> = {
  he: {
    title: "אודות | NB BURGER רעננה",
    description:
      "הכירו את NB BURGER — מסעדת המבורגרים ברעננה. בשר טוב, לחמנייה רכה וחוויה מדויקת על הפלנצ׳ה."
  },
  en: {
    title: "About | NB BURGER Raanana",
    description: "Meet NB BURGER — Raanana's smash-burger spot. Quality beef, soft buns, plancha perfection."
  },
  fr: {
    title: "À propos | NB BURGER Raanana",
    description:
      "Découvrez NB BURGER — burgers smash à Raanana. Viande de qualité, buns moelleux, plancha maîtrisée."
  }
};

const PRIVACY_META: Record<Locale, PageMetaEntry> = {
  he: {
    title: "מדיניות פרטיות | NB BURGER",
    description: "מדיניות הפרטיות של NB BURGER — איסוף מידע, שימוש בנתונים וזכויות המשתמש."
  },
  en: {
    title: "Privacy Policy | NB BURGER",
    description: "NB BURGER privacy policy — data collection, usage and your rights."
  },
  fr: {
    title: "Politique de confidentialité | NB BURGER",
    description: "Politique de confidentialité NB BURGER — collecte, usage des données et vos droits."
  }
};

const TERMS_META: Record<Locale, PageMetaEntry> = {
  he: {
    title: "תקנון האתר | NB BURGER",
    description: "תקנון השימוש באתר NB BURGER."
  },
  en: {
    title: "Terms of Use | NB BURGER",
    description: "Terms of use for the NB BURGER website."
  },
  fr: {
    title: "Conditions d'utilisation | NB BURGER",
    description: "Conditions d'utilisation du site NB BURGER."
  }
};

export function buildLocalizedPageMetadata(
  locale: Locale,
  path: string,
  entry: Record<Locale, PageMetaEntry>
): Metadata {
  const meta = entry[locale] ?? entry.he;
  return buildPageMetadata({ ...meta, path, locale });
}

export function getHomePageMetadata(locale: Locale) {
  return buildLocalizedPageMetadata(locale, "/", HOME_META);
}

export function getMenuPageMetadata(locale: Locale) {
  return buildLocalizedPageMetadata(locale, "/menu", MENU_META);
}

export function getMenuCategoryPageMetadata(
  locale: Locale,
  category: { name: string; description?: string; slug: string }
) {
  const description =
    category.description?.trim() ||
    MENU_META[locale].description;

  return buildPageMetadata({
    title: `${category.name} | NB BURGER`,
    description,
    path: `/menu/category/${category.slug}`,
    locale
  });
}

export function getLocationsPageMetadata(locale: Locale) {
  return buildLocalizedPageMetadata(locale, "/locations", LOCATIONS_META);
}

export function getAboutPageMetadata(locale: Locale) {
  return buildLocalizedPageMetadata(locale, "/about", ABOUT_META);
}

export function getPrivacyPageMetadata(locale: Locale) {
  return buildLocalizedPageMetadata(locale, "/privacy-policy", PRIVACY_META);
}

export function getTermsPageMetadata(locale: Locale) {
  return buildLocalizedPageMetadata(locale, "/terms", TERMS_META);
}
