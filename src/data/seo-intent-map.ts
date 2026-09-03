import { resolveCategorySlug } from "@/lib/menu/category-slug";
import { joinParagraphs, splitParagraphs } from "@/lib/seo-content/paragraphs";
import type { Locale } from "@/i18n/config";
import type {
  ResolvedCategorySeoContent,
  ResolvedSeoPageContent,
  SeoCtaBlock,
  SeoFaqBlock,
  SeoPageFieldsInput,
  SeoPageId
} from "@/types/seo-content";
import type { StoryCtaSection } from "@/types/story";

/**
 * Approved SEO intent map (cannibalization fix).
 * Applied as fallback after CMS, before baked-in defaults win:
 *   CMS (non-empty) → intent → defaults (already in resolved content).
 *
 * Self-canonical stays per-URL. No redirects / noindex / merges.
 */

/** Prefer first non-empty trimmed string (CMS → intent → resolved/default). */
function preferText(
  cms?: string | null,
  intent?: string | null,
  fallback?: string | null
): string {
  const a = cms?.trim();
  if (a) return a;
  const b = intent?.trim();
  if (b) return b;
  return fallback?.trim() ?? "";
}

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
      "ארוחת המבורגר של NB BURGER — המבורגר, תוספת ושתייה בארוחה אחת. נוח לארוחת צהריים, לערב או עם חברים.",
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

function nonEmptyFaqItems(items?: SeoFaqBlock["items"]) {
  return items?.filter((item) => item.question.trim() || item.answer.trim());
}

/** CMS → intent → resolved (defaults). FAQ/CTA are editable in admin. */
function applyFaq(
  current: ResolvedSeoPageContent["faq"],
  patch?: SeoFaqBlock,
  stored?: SeoFaqBlock
): ResolvedSeoPageContent["faq"] {
  const storedItems = nonEmptyFaqItems(stored?.items);
  const intentItems = nonEmptyFaqItems(patch?.items);
  return {
    kicker: preferText(stored?.kicker, patch?.kicker, current.kicker),
    title: preferText(stored?.title, patch?.title, current.title),
    lead: preferText(stored?.lead, patch?.lead, current.lead),
    items:
      storedItems && storedItems.length > 0
        ? storedItems
        : intentItems && intentItems.length > 0
          ? intentItems
          : current.items
  };
}

function applyCta(
  current: SeoCtaBlock,
  patch?: SeoCtaBlock,
  stored?: SeoCtaBlock
): SeoCtaBlock {
  return {
    title: preferText(stored?.title, patch?.title, current.title) || undefined,
    body: preferText(stored?.body, patch?.body, current.body) || undefined,
    buttonLabel:
      preferText(stored?.buttonLabel, patch?.buttonLabel, current.buttonLabel) || undefined,
    buttonHref: preferText(stored?.buttonHref, patch?.buttonHref, current.buttonHref) || undefined
  };
}

function applyCategoryPatch(
  current: ResolvedCategorySeoContent,
  patch: CategoryIntentPatch,
  stored?: SeoPageFieldsInput
): ResolvedCategorySeoContent {
  const introduction = preferText(stored?.introduction, patch.introduction, current.introduction);
  const bottomContent = preferText(
    stored?.bottomContent,
    patch.bottomContent,
    current.bottomContent
  );
  return {
    metaTitle: preferText(stored?.metaTitle, patch.metaTitle, current.metaTitle),
    metaDescription: preferText(
      stored?.metaDescription,
      patch.metaDescription,
      current.metaDescription
    ),
    introduction,
    bottomContent,
    faq: applyFaq(current.faq, patch.faq, stored?.faq),
    cta: applyCta(current.cta, patch.cta, stored?.cta)
  };
}

const EMPTY_CATEGORY_SEO: ResolvedCategorySeoContent = {
  metaTitle: "",
  metaDescription: "",
  introduction: "",
  bottomContent: "",
  faq: { kicker: "", title: "", lead: "", items: [] },
  cta: {}
};

/**
 * Resolve intent patch by stable id (cat-meals) OR public slug (meals).
 * Production categories may use Firebase-generated ids like cat-1785… while slug stays "meals".
 */
export function getCategoryIntentPatch(category: {
  id: string;
  slug?: string;
}): CategoryIntentPatch | undefined {
  const id = category.id.trim();
  if (HE_CATEGORY_INTENT[id]) {
    return HE_CATEGORY_INTENT[id];
  }

  const resolvedSlug = resolveCategorySlug({
    id: category.id,
    slug: category.slug ?? ""
  });
  if (resolvedSlug && HE_CATEGORY_INTENT[`cat-${resolvedSlug}`]) {
    return HE_CATEGORY_INTENT[`cat-${resolvedSlug}`];
  }

  const slug = (category.slug ?? "").trim().toLowerCase();
  if (slug && HE_CATEGORY_INTENT[`cat-${slug}`]) {
    return HE_CATEGORY_INTENT[`cat-${slug}`];
  }

  return undefined;
}

/**
 * Apply category SEO intent as fallback only.
 * With `stored`: CMS → intent → resolved defaults.
 * Without `stored` (already-resolved content from getResolvedSeoPageContent):
 * only fill empty fields so a second pass cannot let intent beat CMS.
 */
export function applyCategorySeoIntent(
  category: { id: string; slug?: string },
  content: ResolvedCategorySeoContent,
  stored?: SeoPageFieldsInput
): ResolvedCategorySeoContent {
  const patch = getCategoryIntentPatch(category);
  if (!patch) {
    return content;
  }
  if (stored) {
    return applyCategoryPatch(content, patch, stored);
  }

  const intentItems = nonEmptyFaqItems(patch.faq?.items);
  const introduction = content.introduction.trim() || patch.introduction?.trim() || "";
  const bottomContent = content.bottomContent.trim() || patch.bottomContent?.trim() || "";
  return {
    metaTitle: content.metaTitle.trim() || patch.metaTitle?.trim() || "",
    metaDescription: content.metaDescription.trim() || patch.metaDescription?.trim() || "",
    introduction,
    bottomContent,
    faq: {
      kicker: content.faq.kicker.trim() || patch.faq?.kicker?.trim() || "",
      title: content.faq.title.trim() || patch.faq?.title?.trim() || "",
      lead: content.faq.lead.trim() || patch.faq?.lead?.trim() || "",
      items:
        content.faq.items.length > 0
          ? content.faq.items
          : intentItems && intentItems.length > 0
            ? intentItems
            : content.faq.items
    },
    cta: {
      title: content.cta.title?.trim() || patch.cta?.title?.trim() || undefined,
      body: content.cta.body?.trim() || patch.cta?.body?.trim() || undefined,
      buttonLabel: content.cta.buttonLabel?.trim() || patch.cta?.buttonLabel?.trim() || undefined,
      buttonHref: content.cta.buttonHref?.trim() || patch.cta?.buttonHref?.trim() || undefined
    }
  };
}

/**
 * Apply approved page-level SEO intent as fallback after CMS+defaults resolve.
 * Pass raw `stored` CMS fields so non-empty admin values always win over intent.
 */
export function applySeoIntentOverrides(
  locale: Locale,
  pageId: SeoPageId,
  content: ResolvedSeoPageContent,
  stored?: SeoPageFieldsInput | null
): ResolvedSeoPageContent {
  if (locale !== "he") {
    return content;
  }

  const patch = HE_PAGE_INTENT[pageId];
  let next = content;

  if (patch) {
    const introduction = preferText(stored?.introduction, patch.introduction, content.introduction);
    const bottomContent = preferText(
      stored?.bottomContent,
      patch.bottomContent,
      content.bottomContent
    );
    next = {
      ...content,
      metaTitle: preferText(stored?.metaTitle, patch.metaTitle, content.metaTitle),
      metaDescription: preferText(
        stored?.metaDescription,
        patch.metaDescription,
        content.metaDescription
      ),
      sectionTitle: preferText(stored?.sectionTitle, patch.sectionTitle, content.sectionTitle),
      introduction,
      introductionParagraphs: splitParagraphs(introduction),
      bottomContent,
      bottomParagraphs: splitParagraphs(bottomContent),
      faq: applyFaq(content.faq, patch.faq, stored?.faq),
      cta: applyCta(content.cta, patch.cta, stored?.cta)
    };
  }

  if (pageId === "menu") {
    const categoryPages = { ...next.categoryPages };
    const storedCategoryPages = stored?.categoryPages ?? {};

    // Patch every existing categoryPages entry whose id/slug matches an intent key.
    for (const categoryId of Object.keys(categoryPages)) {
      const categoryPatch = getCategoryIntentPatch({
        id: categoryId,
        slug: categoryId.replace(/^cat-/, "")
      });
      if (!categoryPatch) continue;
      categoryPages[categoryId] = applyCategoryPatch(
        categoryPages[categoryId],
        categoryPatch,
        storedCategoryPages[categoryId]
      );
    }

    // Keep canonical cat-* keys in sync for code that still looks up cat-meals / cat-burgers.
    for (const [intentKey, categoryPatch] of Object.entries(HE_CATEGORY_INTENT)) {
      const current = categoryPages[intentKey] ?? EMPTY_CATEGORY_SEO;
      categoryPages[intentKey] = applyCategoryPatch(
        current,
        categoryPatch,
        storedCategoryPages[intentKey]
      );
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
