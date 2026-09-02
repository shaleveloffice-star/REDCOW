import { joinParagraphs, splitParagraphs } from "@/lib/seo-content/paragraphs";
import type { Locale } from "@/i18n/config";
import type {
  ResolvedCategorySeoContent,
  ResolvedSeoPageContent,
  SeoCtaBlock,
  SeoFaqBlock,
  SeoPageId
} from "@/types/seo-content";
import type { StoryCtaSection } from "@/types/story";

/**
 * Approved SEO intent map (cannibalization fix).
 * Applied after CMS+defaults merge so production Firestore titles cannot
 * keep competing pages on the same primary cluster.
 *
 * Self-canonical stays per-URL. No redirects / noindex / merges.
 */

type PageIntentPatch = {
  metaTitle?: string;
  metaDescription?: string;
  sectionTitle?: string;
  introduction?: string;
  bottomContent?: string;
  faq?: SeoFaqBlock;
  cta?: SeoCtaBlock;
};

type CategoryIntentPatch = {
  metaTitle?: string;
  metaDescription?: string;
  introduction?: string;
  bottomContent?: string;
  faq?: SeoFaqBlock;
  cta?: SeoCtaBlock;
};

const HE_PAGE_INTENT: Partial<Record<SeoPageId, PageIntentPatch>> = {
  home: {
    metaTitle: "NB BURGER | המבורגר ברעננה",
    metaDescription:
      "מחפשים המבורגר ברעננה או המבורגר רעננה? NB BURGER באחוזה 96 — מסעדה כשרה ברעננה עם המבורגרים מבשר טרי הנטחן במקום, ארוחות ותוספות.",
    faq: {
      kicker: "FAQ",
      title: "שאלות נפוצות",
      lead: "המבורגר ברעננה, כשרות, תפריט, משלוחים ושעות — בקצרה.",
      items: [
        {
          question: "איפה אפשר לאכול המבורגר ברעננה?",
          answer:
            "NB BURGER נמצאת ברחוב אחוזה 96 ברעננה. אם אתם מחפשים המבורגר ברעננה או מסעדה כשרה ברעננה, אפשר לאכול במקום או להזמין משלוח לאזורי החלוקה."
        },
        {
          question: "האם NB BURGER היא מסעדה כשרה ברעננה?",
          answer:
            "כן. NB BURGER היא מסעדה כשרה ברעננה הפועלת תחת כשרות הרבנות. התפריט כשר ומבוסס על חומרי גלם איכותיים."
        },
        {
          question: "איפה רואים את תפריט ההמבורגרים?",
          answer:
            "את כל המנות ניתן לראות בעמוד התפריט. בקטגוריית ההמבורגרים תמצאו גם המבורגר כשר וסמאש בורגר לבחירה."
        },
        {
          question: "האם יש משלוחים?",
          answer:
            "כן. ניתן להזמין משלוחים לרעננה וליישובים באזורי החלוקה. פרטי כתובת, שעות והגעה מעודכנים בעמוד המיקום והשעות."
        },
        {
          question: "מה שעות הפעילות?",
          answer:
            "שעות הפעילות מופיעות בעמוד המיקום והשעות באתר. מומלץ לבדוק לפני ההגעה או ביצוע הזמנה."
        }
      ]
    }
  },
  about: {
    metaTitle: "אודות NB BURGER | הסיפור שלנו",
    metaDescription:
      "הסיפור של NB BURGER — המותג, החזון, הבשר והאנשים מאחורי המסעדה. איך בנינו חוויית המבורגר מדויקת ועקבית.",
    sectionTitle: "הסיפור שמאחורי NB BURGER",
    introduction: joinParagraphs([
      "NB BURGER נולדה מתוך מחשבה פשוטה: להכין המבורגר מחומרי גלם איכותיים, בלי קיצורי דרך ובלי להתפשר על הטעם.",
      "הבשר נטחן במקום מדי יום, כל מנה עולה לפלנצ׳ה רק אחרי ההזמנה, וכל מרכיב נבחר בקפידה — מהלחמנייה ועד הרטבים."
    ]),
    bottomContent: joinParagraphs([
      "מאחורי המותג עומדים אנשים שאוהבים המבורגר אמיתי: דיוק בהכנה, עקביות בכל ביס, ושירות שמכבד את מי שבא אלינו.",
      "רוצים להכיר את NB BURGER ברעננה מקרוב? בדף הבית תמצאו את החוויה המלאה, ובתפריט — את המנות עצמן."
    ]),
    cta: {
      title: "הכירו את NB BURGER",
      body: "לדף הבית של NB BURGER ברעננה — שם מתחיל הסיפור.",
      buttonLabel: "לדף הבית",
      buttonHref: "/"
    }
  },
  locations: {
    metaTitle: "מיקום ושעות | NB BURGER רעננה",
    metaDescription:
      "כתובת NB BURGER ברחוב אחוזה 96, שעות פתיחה, ניווט, איסוף עצמי ואזורי משלוח. כל מה שצריך לפני שמגיעים לסניף רעננה.",
    introduction: joinParagraphs([
      "עמוד המיקום והשעות של NB BURGER מרכז את פרטי הסניף ברעננה: כתובת, שעות פעילות, איך מגיעים, איסוף עצמי ואזורי משלוח.",
      "לפני ביקור או הזמנה — בדקו כאן את השעות המעודכנות ואת אזורי החלוקה."
    ]),
    bottomContent: joinParagraphs([
      "הסניף ברחוב אחוזה 96 מציע ישיבה במקום, איסוף עצמי ומשלוחים לפי אזורי החלוקה המפורטים למעלה.",
      "רוצים להכיר קודם את המותג והתפריט? חזרו לדף הבית של NB BURGER או עברו לתפריט המלא."
    ]),
    faq: {
      kicker: "FAQ",
      title: "שאלות ותשובות",
      lead: "כתובת, שעות, חניה, משלוחים ויצירת קשר.",
      items: [
        {
          question: "איפה נמצא סניף NB BURGER ברעננה?",
          answer:
            "ברחוב אחוזה 96, רעננה — מיקום מרכזי ונגיש. בדף זה תמצאו ניווט, שעות ואיסוף עצמי."
        },
        {
          question: "מה שעות הפעילות של הסניף?",
          answer:
            "שעות הפעילות מופיעות בכרטיס הסניף בעמוד זה ומתעדכנות באתר. מומלץ לבדוק לפני ההגעה, במיוחד בחגים ומועדים."
        },
        {
          question: "האם יש איסוף עצמי ומשלוחים?",
          answer:
            "כן. ניתן לאסוף מהסניף או להזמין משלוח לאזורים שבטווח החלוקה. בדקו את רשימת אזורי המשלוח בעמוד זה."
        },
        {
          question: "האם יש חניה ליד הסניף?",
          answer:
            "באזור אחוזה 96 קיימות אפשרויות חניה בהתאם לזמינות. בשעות עומס מומלץ להגיע מעט מוקדם יותר."
        },
        {
          question: "איך יוצרים קשר?",
          answer:
            "פרטי ההתקשרות מופיעים באתר. נשמח לעזור בשאלות על שעות, הגעה, איסוף עצמי או משלוחים."
        }
      ]
    },
    cta: {
      title: "NB BURGER רעננה",
      body: "לחוויית המסעדה המלאה — דף הבית של NB BURGER.",
      buttonLabel: "לדף הבית",
      buttonHref: "/"
    }
  }
};

const HE_CATEGORY_INTENT: Record<string, CategoryIntentPatch> = {
  "cat-burgers": {
    metaTitle: "המבורגר כשר | NB BURGER",
    metaDescription:
      "המבורגר כשר של NB BURGER — בשר טרי הנטחן במקום, הכנה על הפלנצ׳ה, וסמאש בורגר לצד מגוון המבורגרים בתפריט.",
    introduction: joinParagraphs([
      "מחפשים המבורגר כשר שמוכן מחומרי גלם איכותיים? בקטגוריה הזו תמצאו את ההמבורגרים שלנו — כולל סמאש בורגר — מבשר טרי הנטחן במקום ומוכן על הפלנצ׳ה רק אחרי ההזמנה.",
      "בחרו את הבורגר שמתאים לכם, הוסיפו תוספות ורטבים, והזמינו לאיסוף או משלוח."
    ]),
    bottomContent: joinParagraphs([
      "כל המבורגר כשר אצלנו מתחיל בבשר ובדיוק על הפלנצ׳ה. סמאש בורגר, קלאסי או וריאציות הבית — אותה הקפדה.",
      "מכירים כבר את NB BURGER ברעננה ורוצים את התמונה המלאה על המותג והמיקום? חזרו לדף הבית, או המשיכו לתפריט המלא."
    ]),
    cta: {
      title: "NB BURGER רעננה",
      body: "לדף הבית — המבורגר ברעננה, הסיפור והחוויה המלאה.",
      buttonLabel: "לדף הבית",
      buttonHref: "/"
    }
  },
  "cat-meals": {
    metaTitle: "ארוחת המבורגר | NB BURGER",
    metaDescription:
      "ארוחות המבורגר של NB BURGER — המבורגר, תוספת ושתייה בארוחה אחת. נוח לצהריים, לערב או עם חברים.",
    introduction: joinParagraphs([
      "ארוחת המבורגר מאגדת מנה, תוספת לבחירה ושתייה — פתרון נוח לארוחת צהריים או ערב בלי לוותר על איכות הבשר וההכנה על הפלנצ׳ה.",
      "בחרו ארוחה מהרשימה והשלימו עם התוספת שמתאימה לכם."
    ])
  }
};

export type StorySeoOverride = {
  metaTitle: string;
  metaDescription: string;
};

const STORY_SEO_OVERRIDES: Record<string, StorySeoOverride> = {
  "kosher-burger": {
    metaTitle: "המבורגר כשר — הסיפור מאחורי הבשר | NB BURGER",
    metaDescription:
      "כתבה על המבורגר כשר: למה הבשר חשוב, איך אנחנו מכינים, ומה הופך בורגר כשר לחוויה בלי פשרות — מתוך המגזין של NB BURGER."
  },
  "smash-burger": {
    metaTitle: "סמאש בורגר — הצריבה שעושה את ההבדל | NB BURGER",
    metaDescription:
      "מה הופך סמאש בורגר לטוב באמת? על צריבה, בשר טרי ופלנצ׳ה — כתבה מהמגזין של NB BURGER (לא תפריט ההזמנה)."
  }
};

const STORY_SUPPORT_CTA: Record<string, StoryCtaSection> = {
  "kosher-burger": {
    type: "cta",
    background: "light",
    body: "רוצים להזמין? כל ההמבורגרים הכשרים מחכים בתפריט.",
    label: "לתפריט ההמבורגרים",
    href: "/menu/burgers"
  },
  "smash-burger": {
    type: "cta",
    background: "light",
    body: "בא לכם סמאש בורגר עכשיו? ההמבורגרים שלנו מחכים בתפריט.",
    label: "לתפריט הבורגרים",
    href: "/menu/burgers"
  }
};

function applyFaq(
  current: ResolvedSeoPageContent["faq"],
  patch?: SeoFaqBlock
): ResolvedSeoPageContent["faq"] {
  if (!patch) return current;
  const items = patch.items?.filter((item) => item.question.trim() || item.answer.trim());
  return {
    kicker: patch.kicker?.trim() || current.kicker,
    title: patch.title?.trim() || current.title,
    lead: patch.lead?.trim() || current.lead,
    items: items && items.length > 0 ? items : current.items
  };
}

function applyCta(current: SeoCtaBlock, patch?: SeoCtaBlock): SeoCtaBlock {
  if (!patch) return current;
  return {
    title: patch.title?.trim() || current.title,
    body: patch.body?.trim() || current.body,
    buttonLabel: patch.buttonLabel?.trim() || current.buttonLabel,
    buttonHref: patch.buttonHref?.trim() || current.buttonHref
  };
}

function applyCategoryPatch(
  current: ResolvedCategorySeoContent,
  patch: CategoryIntentPatch
): ResolvedCategorySeoContent {
  const introduction = patch.introduction?.trim() || current.introduction;
  const bottomContent = patch.bottomContent?.trim() || current.bottomContent;
  return {
    metaTitle: patch.metaTitle?.trim() || current.metaTitle,
    metaDescription: patch.metaDescription?.trim() || current.metaDescription,
    introduction,
    bottomContent,
    faq: applyFaq(
      {
        kicker: current.faq.kicker,
        title: current.faq.title,
        lead: current.faq.lead,
        items: current.faq.items
      },
      patch.faq
    ),
    cta: applyCta(current.cta, patch.cta)
  };
}

/** Enforce approved page-level SEO intent after CMS merge. */
export function applySeoIntentOverrides(
  locale: Locale,
  pageId: SeoPageId,
  content: ResolvedSeoPageContent
): ResolvedSeoPageContent {
  if (locale !== "he") {
    return content;
  }

  const patch = HE_PAGE_INTENT[pageId];
  let next = content;

  if (patch) {
    const introduction = patch.introduction?.trim() || content.introduction;
    const bottomContent = patch.bottomContent?.trim() || content.bottomContent;
    next = {
      ...content,
      metaTitle: patch.metaTitle?.trim() || content.metaTitle,
      metaDescription: patch.metaDescription?.trim() || content.metaDescription,
      sectionTitle: patch.sectionTitle?.trim() || content.sectionTitle,
      introduction,
      introductionParagraphs: splitParagraphs(introduction),
      bottomContent,
      bottomParagraphs: splitParagraphs(bottomContent),
      faq: applyFaq(content.faq, patch.faq),
      cta: applyCta(content.cta, patch.cta)
    };
  }

  if (pageId === "menu") {
    const categoryPages = { ...next.categoryPages };
    for (const [categoryId, categoryPatch] of Object.entries(HE_CATEGORY_INTENT)) {
      const current = categoryPages[categoryId];
      if (!current) continue;
      categoryPages[categoryId] = applyCategoryPatch(current, categoryPatch);
    }
    next = { ...next, categoryPages };
  }

  return next;
}

export function getStorySeoOverride(slug: string): StorySeoOverride | undefined {
  return STORY_SEO_OVERRIDES[slug.trim().toLowerCase()];
}

/** Supporting CTA for magazine posts that must not rank as commercial landings. */
export function getStorySupportCta(slug: string): StoryCtaSection | undefined {
  return STORY_SUPPORT_CTA[slug.trim().toLowerCase()];
}
