import type { SmartPasteSection } from "./types";

export const FAQ_SECTION_MARKERS = ["שאלות ותשובות (FAQ)", "שאלות ותשובות"] as const;

export const CTA_SECTION_MARKERS = ["בלוק CTA (אופציונלי)", "בלוק CTA"] as const;

const MAIN_LABELS: Record<string, string> = {
  שם: "name",
  "Slug (באנגלית, לקישור)": "slug",
  Slug: "slug",
  תיאור: "description",
  "מבוא SEO": "introduction",
  "תוכן תחתון": "bottomContent"
};

const FAQ_LABELS: Record<string, string> = {
  "כותרת עליונה": "faqKicker",
  כותרת: "faqTitle",
  "פסקת פתיחה": "faqLead"
};

const CTA_LABELS: Record<string, string> = {
  כותרת: "ctaTitle",
  טקסט: "ctaBody",
  "טקסט כפתור": "ctaButtonLabel",
  "קישור כפתור": "ctaButtonHref"
};

const FAQ_QUESTION_RE = /^שאלה\s+(\d+)$/u;
const FAQ_ANSWER_RE = /^תשובה\s+(\d+)$/u;

export type LabelMatch =
  | { type: "section"; section: SmartPasteSection }
  | { type: "field"; key: string; rawLabel: string }
  | { type: "unknown"; rawLabel: string };

export function normalizePasteLine(line: string): string {
  return line
    .replace(/\uFEFF/g, "")
    .replace(/\s*\([^)]*\)\s*$/u, "")
    .trim();
}

export function matchSectionMarker(line: string): SmartPasteSection | null {
  const normalized = normalizePasteLine(line);
  if (FAQ_SECTION_MARKERS.some((marker) => normalized === marker)) {
    return "faq";
  }
  if (CTA_SECTION_MARKERS.some((marker) => normalized === marker)) {
    return "cta";
  }
  return null;
}

export function matchLabelLine(line: string, section: SmartPasteSection): LabelMatch | null {
  const normalized = normalizePasteLine(line);
  if (!normalized) {
    return null;
  }

  const sectionMarker = matchSectionMarker(normalized);
  if (sectionMarker) {
    return { type: "section", section: sectionMarker };
  }

  const questionMatch = normalized.match(FAQ_QUESTION_RE);
  if (section === "faq" && questionMatch) {
    return { type: "field", key: `faqQuestion:${questionMatch[1]}`, rawLabel: normalized };
  }

  const answerMatch = normalized.match(FAQ_ANSWER_RE);
  if (section === "faq" && answerMatch) {
    return { type: "field", key: `faqAnswer:${answerMatch[1]}`, rawLabel: normalized };
  }

  if (section === "cta" && normalized in CTA_LABELS) {
    return { type: "field", key: CTA_LABELS[normalized]!, rawLabel: normalized };
  }

  if (section === "faq" && normalized in FAQ_LABELS) {
    return { type: "field", key: FAQ_LABELS[normalized]!, rawLabel: normalized };
  }

  if (section === "main" && normalized in MAIN_LABELS) {
    return { type: "field", key: MAIN_LABELS[normalized]!, rawLabel: normalized };
  }

  if (looksLikeStandaloneHeading(normalized)) {
    return { type: "unknown", rawLabel: normalized };
  }

  return null;
}

function looksLikeStandaloneHeading(line: string): boolean {
  if (line.length > 80) return false;
  if (/^[\d.)\-–—]/.test(line)) return false;
  if (FAQ_QUESTION_RE.test(line) || FAQ_ANSWER_RE.test(line)) return false;
  if (matchSectionMarker(line)) return false;

  const known =
    line in MAIN_LABELS ||
    line in FAQ_LABELS ||
    line in CTA_LABELS ||
    FAQ_SECTION_MARKERS.some((marker) => marker === line) ||
    CTA_SECTION_MARKERS.some((marker) => marker === line);

  return !known && /^[\p{L}\d\s()'"/\-–—:]+$/u.test(line);
}

export function joinParagraphs(lines: string[]): string {
  const chunks: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    if (line.trim() === "") {
      if (buffer.length > 0) {
        chunks.push(buffer.join("\n").trim());
        buffer = [];
      }
      continue;
    }
    buffer.push(line);
  }

  if (buffer.length > 0) {
    chunks.push(buffer.join("\n").trim());
  }

  return chunks.join("\n\n");
}
