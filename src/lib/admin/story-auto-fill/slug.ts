import { normalizeStorySlug, isValidStorySlug } from "@/lib/stories/story-slug";

const HE_TO_LATIN: Record<string, string> = {
  א: "a",
  ב: "b",
  ג: "g",
  ד: "d",
  ה: "h",
  ו: "v",
  ז: "z",
  ח: "ch",
  ט: "t",
  י: "y",
  כ: "k",
  ך: "k",
  ל: "l",
  מ: "m",
  ם: "m",
  נ: "n",
  ן: "n",
  ס: "s",
  ע: "a",
  פ: "p",
  ף: "p",
  צ: "tz",
  ץ: "tz",
  ק: "k",
  ר: "r",
  ש: "sh",
  ת: "t"
};

const PHRASE_MAP: Array<[RegExp, string]> = [
  [/המבורגר כשר/g, "kosher-burger"],
  [/סמאש בורגר/g, "smash-burger"],
  [/ארוחת המבורגר/g, "burger-meal"],
  [/המבורגר ברעננה/g, "burger-raanana"],
  [/המבורגר רעננה/g, "burger-raanana"],
  [/מסעדה כשרה/g, "kosher-restaurant"],
  [/רעננה/g, "raanana"],
  [/המבורגר/g, "burger"],
  [/בורגר/g, "burger"],
  [/כשר/g, "kosher"],
  [/תפריט/g, "menu"],
  [/מדריך/g, "guide"],
  [/השוואה/g, "comparison"]
];

function transliterateHebrew(value: string): string {
  let next = value;
  for (const [pattern, replacement] of PHRASE_MAP) {
    next = next.replace(pattern, ` ${replacement} `);
  }
  return [...next]
    .map((ch) => {
      if (/[a-zA-Z0-9]/.test(ch)) return ch.toLowerCase();
      if (HE_TO_LATIN[ch]) return HE_TO_LATIN[ch];
      if (/\s|-|_/.test(ch)) return "-";
      return "";
    })
    .join("");
}

export function buildStoryAutoFillSlug(parts: string[]): string {
  const joined = parts
    .map((part) => transliterateHebrew(part.trim()))
    .filter(Boolean)
    .join("-");
  const normalized = normalizeStorySlug(joined);
  if (normalized && isValidStorySlug(normalized)) {
    return normalized.slice(0, 80);
  }
  const fallback = normalizeStorySlug(`story-${Date.now().toString(36)}`);
  return fallback || `story-${Date.now()}`;
}
