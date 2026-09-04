import type { StoryContextSummary } from "./story-context";
import { STORY_AUTO_FILL_TYPE_LABELS, STORY_AUTO_FILL_TYPES } from "./types";

export type SeoSuggestContextPage = {
  pageId: string;
  label: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  source: "seo-page" | "menu-category";
};

export const STORY_SUGGEST_BRAND_INSTRUCTIONS = `אתה אסטרטג תוכן עבור NB BURGER — מסעדת המבורגרים ברעננה.

שפה: עברית טבעית.

אופי המותג:
- צנוע, נקי, ענייני, בטוח
- לא מתרברב ולא משבח את עצמו
- לא נשמע כמו פרסומת מוגזמת

אסור:
- הכי טוב, מספר 1, המוביל, מושלם, אגדי, מהפכני
- חוויה בלתי נשכחת, טריקים
- ביקורות מומצאות, ציטוטים מומצאים, פרסים מומצאים
- סיפור מותג מומצא / origin story
- עובדות שלא קיימות במערכת

המשימה:
הצע בדיוק 5 רעיונות לסיפורים חדשים למגזין.
כל הצעה חייבת להיות שונה בנושא ובזווית.
הימנע מקניבליזציה מול Stories ודפי SEO קיימים.
אל תציע intent זהה לעמוד בית / תפריט / סניפים / קטגוריות תפריט.

לכל הצעה בחר בעצמך:
- storyType אחד מתוך: ${STORY_AUTO_FILL_TYPES.join(", ")}
- category בעברית (קצרה)
- angle ברורה
- goal
- cta

גוון את סוגי הסיפור — אל תחזיר חמש פעמים magazine.
העדף cannibalizationRisk: low.
אם יש חפיפה חלקית — שנה זווית במקום להתחרות על אותו חיפוש.

החזר אך ורק לפי ה-JSON Schema (Structured Outputs).`.trim();

export function buildStorySuggestUserPrompt(options: {
  stories: StoryContextSummary[];
  seoPages: SeoSuggestContextPage[];
  existingCategories: string[];
  avoidKeywords?: string[];
  neededCount?: number;
}): string {
  const needed = options.neededCount ?? 5;
  const avoid =
    options.avoidKeywords && options.avoidKeywords.length > 0
      ? options.avoidKeywords.join(" | ")
      : "(אין)";

  const typeHints = STORY_AUTO_FILL_TYPES.map(
    (type) => `${type} = ${STORY_AUTO_FILL_TYPE_LABELS[type]}`
  ).join("; ");

  return [
    `החזר בדיוק ${needed} הצעות סיפור חדשות.`,
    "",
    `סוגי storyType מותרים: ${typeHints}`,
    `קטגוריות קיימות באתר (העדף שימוש חוזר אם מתאים): ${
      options.existingCategories.length ? options.existingCategories.join(" | ") : "(אין עדיין)"
    }`,
    "",
    "Stories קיימים (סיכום קומפקטי, בלי גוף מלא):",
    JSON.stringify(options.stories, null, 2),
    "",
    "הקשר SEO / דפים קיימים:",
    JSON.stringify(
      options.seoPages.map((page) => ({
        label: page.label,
        path: page.path,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription.slice(0, 140),
        source: page.source
      })),
      null,
      2
    ),
    "",
    `מילות מפתח / נושאים להימנע מהם (או לשנות זווית משמעותית): ${avoid}`,
    "",
    "לכל הצעה מלא conflictingPages רק אם אתה מזהה חפיפה אפשרית; אחרת מערך ריק.",
    "cannibalizationRisk חייב להיות low / medium / high — נבדוק שוב בשרת."
  ].join("\n");
}
