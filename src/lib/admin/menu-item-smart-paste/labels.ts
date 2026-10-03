import { joinParagraphs } from "@/lib/admin/category-smart-paste/labels";

import type { MenuItemSmartPasteFieldKey } from "./types";

export { joinParagraphs };

export function normalizePasteLine(line: string): string {
  return line.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
    .trim().replace(/^(?:#{1,6}\s+|[-*•]\s+|\d+[.)]\s+)/u, "")
    .replace(/[*_`]/g, "").trim().replace(/[:：]\s*$/, "").trim()
    .replace(/\s+/g, " ");
}

const MAIN_LABELS: Record<string, MenuItemSmartPasteFieldKey> = {
  "שם המנה": "name",
  שם: "name",
  קטגוריה: "category",
  'מחיר (ש"ח)': "price",
  "מחיר (ש״ח)": "price",
  מחיר: "price",
  "תיאור קצר": "description",
  תיאור: "description",
  "תיאור ארוך (גוף העמוד)": "longDescription",
  "תיאור ארוך": "longDescription",
  "טקסט ALT לתמונה (אופציונלי)": "imageAlt",
  "טקסט ALT לתמונה": "imageAlt",
  "ALT תמונה": "imageAlt",
  "מילת מפתח ראשית": "primaryKeyword",
  "מילת מפתח": "primaryKeyword",
  "כותרת מטא (עד 60)": "metaTitle",
  "כותרת מטא": "metaTitle",
  "Meta Title": "metaTitle",
  "תיאור מטא (עד 160)": "metaDescription",
  "תיאור מטא": "metaDescription",
  "Meta Description": "metaDescription",
  "סלאג (כתובת העמוד)": "slug",
  סלאג: "slug",
  Slug: "slug",
  "סדר תצוגה": "sortOrder",
  סדר: "sortOrder",
  תגיות: "tags"
};

const SEO_SECTION_MARKERS = ["תוכן SEO"] as const;

export type LabelMatch =
  | { type: "field"; key: MenuItemSmartPasteFieldKey; rawLabel: string; inlineValue?: string }
  | { type: "unknown"; rawLabel: string };

function resolveLabel(label: string): MenuItemSmartPasteFieldKey | undefined {
  const normalized = normalizePasteLine(label).replace(/\s*\([^)]*\)\s*$/u, "").toLowerCase();
  return Object.entries(MAIN_LABELS).find(([key]) => normalizePasteLine(key).replace(/\s*\([^)]*\)\s*$/u, "").toLowerCase() === normalized)?.[1];
}

export function matchLabelLine(line: string): LabelMatch | null {
  const normalized = normalizePasteLine(line);
  if (!normalized || SEO_SECTION_MARKERS.some(marker => marker === normalized)) return null;
  const key = resolveLabel(normalized);
  if (key) return { type: "field", key, rawLabel: normalized };
  const separator = line.search(/[:：]/);
  if (separator >= 0) {
    const inlineKey = resolveLabel(line.slice(0, separator));
    if (inlineKey) return { type: "field", key: inlineKey, rawLabel: normalizePasteLine(line.slice(0, separator)), inlineValue: line.slice(separator + 1).replace(/^[*_]+\s*/, "").trim() };
  }
  // Plain values (dish names, slugs and paragraphs) are never heading boundaries.
  if (normalized.length <= 80 && (/[:：]\s*(?:\*\*)?\s*$/.test(line) || /^\s*#{1,6}\s+/.test(line))) {
    return { type: "unknown", rawLabel: normalized };
  }
  return null;
}

export function parsePriceValue(raw: string): number | undefined {
  const normalized = raw.replace(/[^\d.,]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function parseSortOrderValue(raw: string): number | undefined {
  const parsed = Number.parseInt(raw.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function parseTagsValue(raw: string): string[] {
  return raw
    .split(/[,،\n;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}
