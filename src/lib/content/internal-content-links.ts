import { resolveStorySlug } from "@/lib/stories/story-slug";
import type { MenuItem } from "@/types/content";
import type { BrandStory, StorySection } from "@/types/story";

type LinkPatch = {
  href: string;
  label: string;
  /** Prefer wrapping an existing plain label when present. */
  preferWrapExistingLabel?: boolean;
  /** Only consider section bodies matching this. */
  bodyMatch?: RegExp;
  /** Sentence to append when the label is not already in the body. */
  appendSentence: string;
};

const STORY_LINK_PATCHES: Record<string, LinkPatch> = {
  "burger-sauces-selection": {
    href: "/menu/sauces",
    label: "הרטבים בתפריט SO WHAT",
    bodyMatch: /רטבים קלאסיים|תוספות סודיות|איולי|רטבים/,
    appendSentence: "מי שמחפש התאמה מדויקת יכול גם לעבור אל [הרטבים בתפריט SO WHAT](/menu/sauces)."
  },
  "fixed-burger-recipe": {
    href: "/menu/hamburger-so-classic",
    label: "המבורגר SO קלאסי",
    bodyMatch: /קלאסי|מתכון קבוע/,
    appendSentence: "הדוגמה הכי ברורה לזה בתפריט היא [המבורגר SO קלאסי](/menu/hamburger-so-classic)."
  },
  "vegetarian-burger-development": {
    href: "/menu/hamburger-nb-vegan",
    label: "ההמבורגר הטבעוני שלנו",
    bodyMatch: /צמחונ|ללא בשר|טבעונ/,
    appendSentence: "בתפריט אפשר למצוא גם את [ההמבורגר הטבעוני שלנו](/menu/hamburger-nb-vegan)."
  },
  "behind-the-scenes-burger": {
    href: "/stories/fixed-burger-recipe",
    label: "איך שומרים על מתכון קבוע",
    bodyMatch: /דיוק|מתכון|סרוויס|הרכבת המנות|סטנדרט|עקביות/,
    appendSentence:
      "על אותה גישה של עקביות אפשר לקרוא גם ב־[איך שומרים על מתכון קבוע](/stories/fixed-burger-recipe)."
  },
  "kosher-burger": {
    href: "/",
    label: "המבורגר ברעננה",
    preferWrapExistingLabel: true,
    bodyMatch: /המבורגר ברעננה/,
    appendSentence: "לא משנה אם חיפשתם [המבורגר ברעננה](/), המבורגר כשר ברעננה או פשוט מקום לאכול בו ארוחה בשרית טובה."
  }
};

const MENU_LINK_PATCHES: Record<string, LinkPatch> = {
  "so-smash": {
    href: "/stories/smash-burger-crispy-edges",
    label: "מה יוצר את הקצוות הקריספיים",
    bodyMatch: /סמאש|קריספי|צרוב|פלנצ/,
    appendSentence:
      "מי שרוצה להבין לעומק [מה יוצר את הקצוות הקריספיים](/stories/smash-burger-crispy-edges) יכול לקרוא את הסיפור על הסמאש."
  }
};

function hasMarkdownLink(text: string, label: string, href: string): boolean {
  return text.includes(`[${label}](${href})`);
}

function hasHref(text: string, href: string): boolean {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\]\\(${escaped}\\)`, "i").test(text);
}

function wrapFirstPlainLabel(text: string, label: string, href: string): string | null {
  if (hasMarkdownLink(text, label, href)) return null;
  const linkedLabel = new RegExp(
    `\\[${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\([^\\)]*\\)`
  );
  if (linkedLabel.test(text)) return null;
  const idx = text.indexOf(label);
  if (idx < 0) return null;
  return `${text.slice(0, idx)}[${label}](${href})${text.slice(idx + label.length)}`;
}

function appendSentence(text: string, sentence: string): string {
  if (text.includes(sentence)) return text;
  const trimmed = text.trimEnd();
  if (!trimmed) return sentence;
  const joiner = /[.!?…]"?$/.test(trimmed) || trimmed.endsWith("\n") ? " " : ". ";
  // Prefer paragraph break for long-content bodies.
  if (trimmed.includes("\n\n")) {
    return `${trimmed}\n\n${sentence}`;
  }
  return `${trimmed}${joiner}${sentence}`;
}

function applyPatchToText(text: string, patch: LinkPatch): string {
  if (!text.trim()) return text;
  if (hasMarkdownLink(text, patch.label, patch.href) || hasHref(text, patch.href)) {
    return text;
  }
  if (patch.bodyMatch && !patch.bodyMatch.test(text)) {
    return text;
  }

  if (patch.preferWrapExistingLabel) {
    const wrapped = wrapFirstPlainLabel(text, patch.label, patch.href);
    if (wrapped) return wrapped;
  }

  if (text.includes(patch.label)) {
    const wrapped = wrapFirstPlainLabel(text, patch.label, patch.href);
    if (wrapped) return wrapped;
  }

  return appendSentence(text, patch.appendSentence);
}

function enrichSections(sections: StorySection[], patch: LinkPatch): StorySection[] {
  let applied = false;
  return sections.map((section) => {
    if (applied) return section;
    if (!("body" in section) || typeof section.body !== "string" || !section.body.trim()) {
      return section;
    }
    const nextBody = applyPatchToText(section.body, patch);
    if (nextBody === section.body) return section;
    applied = true;
    return { ...section, body: nextBody };
  });
}

/** Public-page enrichment only — does not mutate CMS storage. */
export function enrichBrandStoryContentLinks(story: BrandStory): BrandStory {
  const slug = resolveStorySlug(story);
  const patch = STORY_LINK_PATCHES[slug];
  if (!patch) return story;
  const sections = enrichSections(story.sections ?? [], patch);
  if (sections === story.sections) return story;
  const changed = sections.some((section, index) => section !== story.sections[index]);
  if (!changed) return story;
  return { ...story, sections };
}

/** Public-page enrichment only — does not mutate CMS storage. */
export function enrichMenuItemContentLinks(item: MenuItem): MenuItem {
  const slug = String(item.slug ?? "").trim();
  const patch = MENU_LINK_PATCHES[slug];
  if (!patch) return item;
  const longDescription = String(item.longDescription ?? "");
  const next = applyPatchToText(longDescription, patch);
  if (next === longDescription) return item;
  return { ...item, longDescription: next };
}

export const INTERNAL_CONTENT_LINK_TARGETS = [
  "/menu/sauces",
  "/menu/hamburger-so-classic",
  "/menu/hamburger-nb-vegan",
  "/stories/fixed-burger-recipe",
  "/stories/smash-burger-crispy-edges",
  "/"
] as const;
