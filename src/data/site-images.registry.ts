import type { SiteImageCatalogItem, SiteImageGroup } from "@/types/site-images";

export const SITE_LOGO_SRC = "/images/brand/nb-burger-logo.png";

export const HERO_DEFAULT_IMAGE_URL = "/images/hero/nb-burger-hero.jpg";

export const PLANCHA_HERO_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/fc6fd6ffa_generated_6a27dd75.png";
export const PLANCHA_MEAT_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/21643f3fd_generated_7967e20d.png";
export const PLANCHA_SEAR_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/d08d12d07_generated_1c743746.png";
export const PLANCHA_BITE_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/87923e711_generated_8b7dae79.png";
export const PLANCHA_BURGERS_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/b1ad5e10e_generated_fc149b91.png";

export const KITCHEN_BURGER_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/250dd08d5_generated_50e0af93.png";
export const KITCHEN_SIDES_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/0839e085a_generated_166b5f83.png";
export const KITCHEN_SAUCES_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/81424122c_generated_cf166321.png";
export const KITCHEN_GRILL_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/59d513b52_generated_30699263.png";

export const ATMOSPHERE_WIDE_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/66d0f2dd1_generated_bc1a932d.png";
export const ATMOSPHERE_PEOPLE_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/c51161c5a_generated_374fe50f.png";
export const ATMOSPHERE_SIGN_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/d1c62ae3c_generated_d1880d3a.png";
export const ATMOSPHERE_FOOD_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/e10288def_generated_1c5867a8.png";

export const LOCATION_EXTERIOR_IMAGE =
  "https://media.base44.com/images/public/6a10bf460e2c0b52f6df3949/f40491832_generated_9eac8545.png";

export const ABOUT_PAGE_IMAGES = {
  hero: "/images/hero/burger-hero.png",
  classic: "/images/menu/red-cow-classic.png",
  fries: "/images/menu/red-cow-fries.png",
  experience: "/images/experience/red-cow-experience.png",
  smoked: "/images/menu/smoked-burger.png"
} as const;

function item(
  id: string,
  label: string,
  location: string,
  imageUrl: string
): SiteImageCatalogItem {
  return {
    id,
    label,
    location,
    imageUrl,
    source: "static",
    defaultImageUrl: imageUrl
  };
}

export const STATIC_SITE_IMAGE_GROUPS: SiteImageGroup[] = [
  {
    title: "מיתוג",
    items: [item("brand-logo", "לוגו NB BURGER", "כותרת האתר / לוגו", SITE_LOGO_SRC)]
  },
  {
    title: "דף הבית — על הפלנצ׳ה",
    items: [
      item("plancha-hero", "תמונת גיבור — הפלנצ׳ה", "סקשן על הפלנצ׳ה (רקע עליון)", PLANCHA_HERO_IMAGE),
      item("plancha-meat", "הבשר", "כרטיס: הבשר", PLANCHA_MEAT_IMAGE),
      item("plancha-sear", "הצריבה", "כרטיס: הצריבה", PLANCHA_SEAR_IMAGE),
      item("plancha-bite", "הביס", "כרטיס: הביס", PLANCHA_BITE_IMAGE),
      item("plancha-burgers", "מבחר המבורגרים", "תמונת סיום הסקשן", PLANCHA_BURGERS_IMAGE)
    ]
  },
  {
    title: "דף הבית — מה יוצא מהמטבח",
    items: [
      item("kitchen-burger", "המבורגרים", "כרטיס: המבורגרים", KITCHEN_BURGER_IMAGE),
      item("kitchen-sides", "תוספות", "כרטיס: תוספות", KITCHEN_SIDES_IMAGE),
      item("kitchen-sauces", "רוטבים", "כרטיס: רוטבים", KITCHEN_SAUCES_IMAGE),
      item("kitchen-grill", "פלנצ׳ה בוערת", "תמונת סיום הסקשן", KITCHEN_GRILL_IMAGE)
    ]
  },
  {
    title: "דף הבית — האווירה",
    items: [
      item("atmosphere-wide", "אווירה במסעדה", "גלריית האווירה", ATMOSPHERE_WIDE_IMAGE),
      item("atmosphere-people", "אנשים נהנים", "גלריית האווירה", ATMOSPHERE_PEOPLE_IMAGE),
      item("atmosphere-sign", "שלט NB Burger", "גלריית האווירה", ATMOSPHERE_SIGN_IMAGE),
      item("atmosphere-food", "אוכל במסעדה", "גלריית האווירה", ATMOSPHERE_FOOD_IMAGE)
    ]
  },
  {
    title: "דף הבית — מיקום ושעות",
    items: [
      item("location-exterior", "חזית המסעדה", "סקשן מיקום ושעות", LOCATION_EXTERIOR_IMAGE)
    ]
  },
  {
    title: "דף אודות",
    items: [
      item("about-hero", "גיבור", "דף אודות", ABOUT_PAGE_IMAGES.hero),
      item("about-classic", "מנה קלאסית", "דף אודות", ABOUT_PAGE_IMAGES.classic),
      item("about-fries", "צ׳יפס", "דף אודות", ABOUT_PAGE_IMAGES.fries),
      item("about-experience", "חוויה", "דף אודות", ABOUT_PAGE_IMAGES.experience),
      item("about-smoked", "המבורגר מעושן", "דף אודות", ABOUT_PAGE_IMAGES.smoked)
    ]
  }
];
