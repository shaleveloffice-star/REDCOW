import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import type { StoryCtaSection, StoryLongContentSection, StorySection, StorySplitSection } from "@/types/story";

import { findStoryCannibalizationHits } from "./cannibalization";
import { buildStoryAutoFillSlug } from "./slug";
import type {
  StoryAutoFillCta,
  StoryAutoFillDraftFields,
  StoryAutoFillExistingStory,
  StoryAutoFillGoal,
  StoryAutoFillInput,
  StoryAutoFillLength,
  StoryAutoFillResult,
  StoryAutoFillType
} from "./types";
import { STORY_AUTO_FILL_TYPE_LABELS } from "./types";

function trimSentence(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function secondaryList(input: string): string[] {
  return input
    .split(/[,،\n|/]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function pickSecondary(secondaries: string[], index: number, fallback: string): string {
  return secondaries[index] ?? fallback;
}

function resolveCta(
  cta: StoryAutoFillCta,
  goal: StoryAutoFillGoal
): { label: string; href: string; body: string } | null {
  const resolved =
    cta === "auto"
      ? goal === "branch"
        ? "locations"
        : goal === "menu-item" || goal === "seo"
          ? "menu"
          : goal === "customer-info"
            ? "locations"
            : "menu"
      : cta;

  if (resolved === "none") return null;
  if (resolved === "locations") {
    return {
      label: "למיקום ולשעות",
      href: "/locations",
      body: "לפרטי הסניף, שעות הפעילות ואפשרויות ההגעה."
    };
  }
  if (resolved === "order") {
    return {
      label: "להזמנה",
      href: "/menu",
      body: "אפשר לעבור לתפריט ומשם להמשיך להזמנה."
    };
  }
  return {
    label: "לתפריט",
    href: "/menu",
    body: "אם בא לכם להמשיך משם — התפריט מחכה."
  };
}

function categoryForType(type: StoryAutoFillType): string {
  switch (type) {
    case "guide":
      return "מדריכים";
    case "brand":
      return "הסיפור שלנו";
    case "food":
      return "אוכל";
    case "comparison":
      return "השוואות";
    case "faq":
      return "שאלות ותשובות";
    case "magazine":
    default:
      return "מגזין";
  }
}

function buildTitle(input: StoryAutoFillInput): string {
  const primary = trimSentence(input.primaryKeyword);
  const angle = trimSentence(input.angle);
  switch (input.storyType) {
    case "guide":
      return angle ? `${primary}: ${angle}` : `מדריך קצר על ${primary}`;
    case "comparison":
      return angle ? `${primary} — ${angle}` : `${primary}: נקודות להשוואה`;
    case "faq":
      return angle ? `${primary}: שאלות נפוצות` : `שאלות נפוצות על ${primary}`;
    case "brand":
      return angle || `הערות קצרות על ${primary}`;
    case "food":
      return angle ? `${primary} במטבח` : `על ${primary} במטבח`;
    case "magazine":
    default:
      return angle || `הערות על ${primary}`;
  }
}

function buildSubtitle(input: StoryAutoFillInput, title: string): string {
  const primary = trimSentence(input.primaryKeyword);
  const angle = trimSentence(input.angle);
  if (input.storyType === "magazine") {
    return angle
      ? `מבט ענייני על ${primary}: ${angle}. בלי הגזמות — רק מה שרלוונטי להבנה.`
      : `מבט ענייני על ${primary}, מתוך ההקשר של מסעדה מקומית ברעננה.`;
  }
  if (input.storyType === "guide") {
    return `הסבר מסודר על ${primary}${angle ? ` — ${angle}` : ""}, בצורה קריאה וברורה.`;
  }
  if (input.storyType === "faq") {
    return `תשובות קצרות לשאלות נפוצות סביב ${primary}.`;
  }
  if (input.storyType === "comparison") {
    return `השוואה עניינית${angle ? ` (${angle})` : ""} סביב ${primary}, כדי לעזור לבחור בצורה מדויקת יותר.`;
  }
  if (input.storyType === "food") {
    return `הסתכלות קולינרית על ${primary}${angle ? `: ${angle}` : ""}.`;
  }
  return `הקשר קצר למותג סביב ${primary}${angle ? ` — ${angle}` : ""}. (${title})`.slice(0, 180);
}

function buildMeta(title: string, subtitle: string, primary: string): {
  metaTitle: string;
  metaDescription: string;
} {
  const metaTitle = `${title} | NB BURGER`.slice(0, 60);
  const metaDescription = trimSentence(
    `${subtitle} ${primary ? `מיקוד: ${primary}.` : ""}`.slice(0, 155)
  );
  return { metaTitle, metaDescription };
}

function splitSection(
  type: "split-text-image" | "split-image-text",
  title: string,
  body: string,
  kicker?: string
): StorySplitSection {
  return {
    type,
    kicker: kicker?.trim() || undefined,
    title,
    body,
    imageUrl: "",
    imageAlt: `תמונה למקטע: ${title}`
  };
}

function longSection(title: string, body: string, kicker?: string): StoryLongContentSection {
  return {
    type: "long-content",
    kicker: kicker?.trim() || undefined,
    title,
    body
  };
}

function ctaSection(cta: { label: string; href: string; body: string }): StoryCtaSection {
  return {
    type: "cta",
    body: cta.body,
    label: cta.label,
    href: cta.href
  };
}

function faqBody(primary: string, secondaries: string[]): string {
  const s1 = pickSecondary(secondaries, 0, primary);
  const s2 = pickSecondary(secondaries, 1, "התפריט");
  return [
    `### מה חשוב לדעת על ${primary}?`,
    `הנקודה המרכזית היא בהירות: מה מחפשים, מה מקבלים, ומה כדאי לבדוק לפני שמזמינים או מגיעים.`,
    ``,
    `### איך ${s1} קשור לנושא?`,
    `${s1} נכנס כאן כהקשר משלים — לא כסיסמה, אלא כחלק מהתמונה המלאה של הבחירה.`,
    ``,
    `### איפה רואים ${s2}?`,
    `פרטים מעודכנים על מנות ואפשרויות מופיעים בתפריט. עמוד זה נועד להסביר, לא להחליף את עמוד ההזמנה.`
  ].join("\n");
}

function sectionPlan(
  input: StoryAutoFillInput,
  title: string
): Array<{ kind: "split-a" | "split-b" | "long" | "faq"; title: string; body: string; kicker?: string }> {
  const primary = trimSentence(input.primaryKeyword);
  const angle = trimSentence(input.angle) || `הבנה בסיסית של ${primary}`;
  const secondaries = secondaryList(input.secondaryKeywords);
  const s1 = pickSecondary(secondaries, 0, "הכנה");
  const s2 = pickSecondary(secondaries, 1, "חומרי גלם");
  const s3 = pickSecondary(secondaries, 2, "חוויית הגעה");

  const intro = {
    kind: "split-a" as const,
    kicker: STORY_AUTO_FILL_TYPE_LABELS[input.storyType],
    title: angle,
    body:
      input.storyType === "magazine"
        ? `הכתבה הזו מסתכלת על ${primary} מזווית ${angle}. המטרה היא להסביר בקצרה מה חשוב לדעת — בלי להגזים ובלי להמציא סיפורים.`
        : `כאן מרכזים הסבר ברור על ${primary}, סביב הזווית: ${angle}. הטקסט נשאר ענייני וקצר ככל האפשר.`
  };

  const context = {
    kind: "long" as const,
    kicker: "הקשר",
    title: `מה עומד מאחורי ${primary}`,
    body: [
      `${primary} מעניין בעיקר כשיודעים מה לבדוק: ${s1}, ${s2}, והתאמה למה שמחפשים בארוחה.`,
      `NB BURGER פועלת ברעננה. העמוד הזה לא מחליף את התפריט או את עמוד המיקום — הוא רק מוסיף הקשר לקריאה.`
    ].join("\n\n")
  };

  const detail = {
    kind: "split-b" as const,
    kicker: s1,
    title: `נקודה מרכזית: ${s1}`,
    body: `כשמדברים על ${primary}, ${s1} הוא חלק מהתמונה. כדאי להסתכל על זה לצד ${s2}, בלי להפוך את זה לרשימת סיסמאות.`
  };

  const practice = {
    kind: "long" as const,
    kicker: "בפועל",
    title: "איך ניגשים לזה בפועל",
    body: [
      `אם המטרה היא ${angle}, התחילו מהשאלה הפשוטה: מה חשוב לכם בארוחה הזו.`,
      `אחר כך אפשר לעבור לתפריט או לפרטי הסניף — לפי מה שרלוונטי לרגע.`
    ].join("\n\n")
  };

  const nuance = {
    kind: "split-a" as const,
    kicker: s2,
    title: `${s2} ו${s3}`,
    body: `${s2} ו${s3} משלימים זה את זה. לא חייבים להעמיק בכל פרט — מספיק להבין מה משפיע על הבחירה סביב ${primary}.`
  };

  const faq = {
    kind: "faq" as const,
    kicker: "FAQ",
    title: "שאלות נפוצות",
    body: faqBody(primary, secondaries)
  };

  const closing = {
    kind: "long" as const,
    title: "לסיכום",
    body: `${title.replace(/\s*\|\s*NB BURGER$/i, "")} נשאר בנושא אחד: ${primary}. אם משהו כאן רלוונטי להמשך — התפריט או עמוד המיקום הם הצעד הבא.`
  };

  const length: StoryAutoFillLength = input.length;
  if (length === "short") {
    return [intro, context, detail];
  }
  if (length === "medium") {
    const base = [intro, context, detail, practice];
    if (input.storyType === "faq" || input.goal === "customer-info" || input.goal === "seo") {
      return [...base, faq];
    }
    return base;
  }
  const longBase = [intro, context, detail, practice, nuance];
  if (input.storyType === "faq" || input.goal !== "brand") {
    return [...longBase, faq, closing];
  }
  return [...longBase, closing];
}

function toSections(
  plan: ReturnType<typeof sectionPlan>,
  cta: ReturnType<typeof resolveCta>
): StorySection[] {
  const sections: StorySection[] = plan.map((item, index) => {
    if (item.kind === "faq" || item.kind === "long") {
      return longSection(item.title, item.body, item.kicker);
    }
    const splitType = item.kind === "split-b" || index % 2 === 1 ? "split-image-text" : "split-text-image";
    return splitSection(splitType, item.title, item.body, item.kicker);
  });
  if (cta) {
    sections.push(ctaSection(cta));
  }
  return sections;
}

export function generateStoryAutoFill(options: {
  input: StoryAutoFillInput;
  existingStories: StoryAutoFillExistingStory[];
  excludeStoryId?: string;
  /** When true, still return fields even if overlaps exist (user confirmed). */
  acknowledgeOverlaps?: boolean;
}): StoryAutoFillResult {
  const primary = trimSentence(options.input.primaryKeyword);
  const angle = trimSentence(options.input.angle);
  if (!primary) {
    throw new Error("מילת מפתח ראשית נדרשת.");
  }
  if (!angle) {
    throw new Error("נושא / זווית הסיפור נדרשים.");
  }

  const warnings = findStoryCannibalizationHits(options.input, options.existingStories, {
    excludeStoryId: options.excludeStoryId
  });
  const blocked = warnings.some((hit) => hit.source !== "story" || hit.reason.includes("מפורסם"));

  const title = buildTitle(options.input).slice(0, 90);
  const subtitle = buildSubtitle(options.input, title).slice(0, 220);
  const slug = buildStoryAutoFillSlug([primary, options.input.storyType, angle]).slice(0, 80);
  const { metaTitle, metaDescription } = buildMeta(title, subtitle, primary);
  const cta = resolveCta(options.input.cta, options.input.goal);
  const plan = sectionPlan(options.input, title);
  const sections = toSections(plan, cta);

  const fields: StoryAutoFillDraftFields = {
    title,
    slug,
    category: categoryForType(options.input.storyType),
    subtitle,
    heroImageAlt: `תמונה לכתבה: ${title}`,
    metaTitle,
    metaDescription,
    ogImageSuggestion: DEFAULT_OG_IMAGE,
    sections
  };

  if (blocked && !options.acknowledgeOverlaps) {
    return {
      ok: true,
      fields,
      warnings,
      blocked: true
    };
  }

  return {
    ok: true,
    fields,
    warnings,
    blocked: false
  };
}

export function storyDraftHasContent(story: {
  title?: string;
  subtitle?: string;
  sections?: StorySection[];
  metaTitle?: string;
  metaDescription?: string;
}): boolean {
  if (story.title?.trim() || story.subtitle?.trim()) return true;
  if (story.metaTitle?.trim() || story.metaDescription?.trim()) return true;
  if ((story.sections?.length ?? 0) > 0) return true;
  return false;
}

export function applyStoryAutoFillToDraft<T extends {
  title: string;
  slug: string;
  category: string;
  subtitle: string;
  heroImageAlt: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  sections: StorySection[];
  isActive: boolean;
}>(draft: T, fields: StoryAutoFillDraftFields): T {
  return {
    ...draft,
    title: fields.title,
    slug: fields.slug,
    category: fields.category,
    subtitle: fields.subtitle,
    heroImageAlt: fields.heroImageAlt,
    metaTitle: fields.metaTitle,
    metaDescription: fields.metaDescription,
    ogImageUrl: fields.ogImageSuggestion || draft.ogImageUrl,
    sections: fields.sections,
    isActive: false
  };
}
