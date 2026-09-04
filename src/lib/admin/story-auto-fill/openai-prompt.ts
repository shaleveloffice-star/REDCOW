import {
  STORY_AUTO_FILL_CTA_LABELS,
  STORY_AUTO_FILL_GOAL_LABELS,
  STORY_AUTO_FILL_LENGTH_LABELS,
  STORY_AUTO_FILL_TYPE_LABELS,
  type StoryAutoFillInput,
  type StoryAutoFillExistingStory
} from "./types";

export const STORY_GENERATE_BRAND_INSTRUCTIONS = `אתה כותב תוכן עבור NB BURGER — מסעדת המבורגרים ברעננה.

שפה: עברית טבעית בלבד (חוץ מ-slug באנגלית).

אופי המותג:
- צנוע, ענייני, נקי, בטוח
- לא מתרברב ולא משבח את עצמו

אסור לכתוב:
- הכי טוב, מספר 1, המוביל, מושלם, מטורף, אגדי
- חוויה בלתי נשכחת, טריקים, מהפכה
- או ניסוחים מוגזמים דומים

אסור להמציא:
- ביקורות, ציטוטים, עובדות, פרסים, היסטוריה, origin story

אל תכתוב ניסוחים כמו:
"NB BURGER נולד מתוך אהבה להמבורגר"

אם storyType הוא magazine (כתבה מגזינית):
כתוב בסגנון מערכתי/מגזיני, כאילו מישהו מתאר את המקום מבחוץ,
אבל בלי להעמיד פנים שעיתונאי או מבקר חיצוני אמיתי כתב אותה.

טון נכון:
"NB BURGER מציע תפריט שמבוסס על המבורגרים, מנות בשריות ותוספות שמתחברות לארוחה שלמה."

טון לא נכון:
"NB BURGER הוא המקום הכי טוב בעיר והמבורגר שחייבים לטעום."

SEO:
- primaryKeyword היא מילת המפתח המרכזית
- secondaryKeywords רק אם טבעי — בלי keyword stuffing
- אל תחזור על exact match בצורה מלאכותית
- H1 אחד בלבד (title)
- Meta Title קצר וברור
- Meta Description טבעי
- Slug קצר באנגלית (kebab-case)
- כותרות מקטעים ברורות כמו H2

מבנה לפי length:
- short: בדיוק 3 מקטעי תוכן (+ CTA נפרד אם נדרש)
- medium: 4 מקטעי תוכן, FAQ רק אם מתאים, + CTA אם נדרש
- long: 5–6 מקטעי תוכן, FAQ אם מתאים, + CTA אם נדרש

סוגי section מותרים בלבד (שדה type):
- split-text-image
- split-image-text
- full-image
- quote
- cta
- long-content

כללי שדות במקטע:
- שדות שלא רלוונטיים לסוג — מחרוזת ריקה ""
- imageUrl לא קיים בסכמה; אל תמציא כתובות תמונה
- ל-split: מלא title, body, imageAlt
- ל-long-content: מלא body (ו־title/kicker אם מתאים)
- ל-quote: מלא text בלבד אם באמת ציטוט כללי לא מומצא; העדף long-content על ציטוטים מומצאים
- ל-cta: label + href (/menu או /locations) + body קצר
- ל-full-image: imageAlt (+ caption אופציונלי)

אם יש CTA בבקשה — הוסף מקטע type "cta" בסוף.
אם cta הוא none — אל תוסיף מקטע cta.

אל תמציא ביקורות לקוחות או ציטוטים מיוחסים.`.trim();

function secondaryList(input: string): string[] {
  return input
    .split(/[,،\n|/]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function buildStoryGenerateUserPrompt(options: {
  input: StoryAutoFillInput;
  existingStories: StoryAutoFillExistingStory[];
}): string {
  const { input, existingStories } = options;
  const secondaries = secondaryList(input.secondaryKeywords);
  const existingSummary = existingStories.slice(0, 40).map((story) => ({
    title: story.title,
    slug: story.slug,
    metaTitle: story.metaTitle ?? "",
    topicHint: [story.title, story.subtitle, story.metaTitle ?? ""].filter(Boolean).join(" — ").slice(0, 160)
  }));

  const lengthHint =
    input.length === "short"
      ? "3 מקטעי תוכן (+ CTA אם נדרש)"
      : input.length === "medium"
        ? "4 מקטעי תוכן, FAQ רק אם מתאים, + CTA אם נדרש"
        : "5–6 מקטעי תוכן, FAQ אם מתאים, + CTA אם נדרש";

  return [
    "צור טיוטת Story מלאה לפי הפרמטרים הבאים.",
    "",
    `primaryKeyword: ${input.primaryKeyword.trim()}`,
    `secondaryKeywords: ${secondaries.length ? secondaries.join(" | ") : "(אין)"}`,
    `storyType: ${input.storyType} (${STORY_AUTO_FILL_TYPE_LABELS[input.storyType]})`,
    `angle: ${input.angle.trim() || "(נגזר ממילת המפתח — בחר זווית עניינית)"}`,
    `length: ${input.length} (${STORY_AUTO_FILL_LENGTH_LABELS[input.length]}) → ${lengthHint}`,
    `goal: ${input.goal} (${STORY_AUTO_FILL_GOAL_LABELS[input.goal]})`,
    `cta: ${input.cta} (${STORY_AUTO_FILL_CTA_LABELS[input.cta]})`,
    "",
    "הקשר קניבליזציה — עמודים/סיפורים קיימים (הימנע מחפיפה משמעותית בזווית ובמיקוד):",
    JSON.stringify(existingSummary, null, 2),
    "",
    "החזר אך ורק לפי ה-JSON Schema שהוגדר (Structured Outputs)."
  ].join("\n");
}
