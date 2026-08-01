import { joinParagraphs, normalizePasteLine } from "@/lib/admin/category-smart-paste/labels";

import type { MenuItemSmartPasteFieldKey } from "./types";

export { joinParagraphs, normalizePasteLine };

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
  | { type: "field"; key: MenuItemSmartPasteFieldKey; rawLabel: string }
  | { type: "unknown"; rawLabel: string };

export function matchLabelLine(line: string): LabelMatch | null {
  const normalized = normalizePasteLine(line);
  if (!normalized) return null;

  if (SEO_SECTION_MARKERS.some((marker) => marker === normalized)) {
    return null;
  }

  if (normalized in MAIN_LABELS) {
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
  if (line in MAIN_LABELS || SEO_SECTION_MARKERS.some((marker) => marker === line)) {
    return false;
  }
  return /^[\p{L}\d\s()'"/\-–—:]+$/u.test(line);
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
