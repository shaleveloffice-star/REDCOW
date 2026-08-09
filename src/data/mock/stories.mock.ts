import {
  HOME_STORY_IMAGE,
  LOCATION_EXTERIOR_IMAGE,
  PLANCHA_MEAT_IMAGE,
  PLANCHA_SEAR_IMAGE
} from "@/data/site-images.registry";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import type { BrandStory } from "@/types/story";

const now = "2026-08-09T10:00:00.000Z";

export const mockBrandStories: BrandStory[] = [
  {
    id: "story-good-burger-returns",
    slug: "ma-hofech-hamburger-tov",
    category: "הסיפור שלנו",
    title: "מה הופך המבורגר טוב להמבורגר שחוזרים אליו?",
    subtitle:
      "המבורגר טוב יכול לקרות פעם אחת. המבחן האמיתי הוא לקבל אותו בדיוק כמו שאהבתם גם בפעם הבאה.",
    heroImageUrl: DEFAULT_OG_IMAGE,
    heroImageAlt: "המבורגר NB BURGER",
    metaTitle: "מה הופך המבורגר טוב להמבורגר שחוזרים אליו? | NB BURGER",
    metaDescription:
      "סיפור קצר על עקביות, דיוק וחוויה — מה שמבדיל המבורגר שחוזרים אליו מזה שפוגשים פעם אחת.",
    ogImageUrl: DEFAULT_OG_IMAGE,
    publishedAt: now,
    isActive: false,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    sections: [
      {
        type: "split-text-image",
        kicker: "חומרי גלם",
        title: "[עריכה: כותרת מקטע — חומרי גלם]",
        body: "[עריכה: פסקה קצרה על חומרי הגלם. הוסיפו כאן רק מידע שאתם מאשרים לפרסם.]",
        imageUrl: PLANCHA_MEAT_IMAGE,
        imageAlt: "[עריכה: תיאור תמונה — חומרי גלם]"
      },
      {
        type: "split-image-text",
        kicker: "הכנה",
        title: "[עריכה: כותרת מקטע — דיוק בהכנה]",
        body: "[עריכה: פסקה קצרה על תהליך ההכנה. הימנעו מטענות שלא אושרו.]",
        imageUrl: PLANCHA_SEAR_IMAGE,
        imageAlt: "[עריכה: תיאור תמונה — הכנה על הפלנצ׳ה]"
      },
      {
        type: "full-image",
        imageUrl: LOCATION_EXTERIOR_IMAGE,
        imageAlt: "[עריכה: תיאור תמונה — חוויית המסעדה]",
        caption: "[עריכה: כיתוב אופציונלי לתמונה]"
      },
      {
        type: "quote",
        text: "עקביות היא מה שגורם לכם לחזור — לא רק טעם טוב בפעם הראשונה.",
        attribution: "NB BURGER"
      },
      {
        type: "split-text-image",
        kicker: "חוויה",
        title: "[עריכה: כותרת מקטע — חוויית האורח]",
        body: "[עריכה: פסקה קצרה על חוויית הלקוח. התאימו לקול המותג.]",
        imageUrl: HOME_STORY_IMAGE,
        imageAlt: "[עריכה: תיאור תמונה — חוויה]"
      },
      {
        type: "cta",
        body: "מוכנים לטעום?",
        label: "לתפריט",
        href: "/menu"
      },
      {
        type: "cta",
        body: "מגיעים אלינו או מזמינים.",
        label: "מיקום ושעות",
        href: "/locations"
      }
    ]
  }
];
