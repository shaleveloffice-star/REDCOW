import {
  joinParagraphs,
  matchLabelLine,
  matchSectionMarker,
  normalizePasteLine
} from "./labels";
import type {
  CategorySmartPasteData,
  CategorySmartPastePreview,
  ParsedFaqItem,
  SmartPasteFieldKey,
  SmartPasteSection
} from "./types";

type MarkerEntry = {
  lineIndex: number;
  match: ReturnType<typeof matchLabelLine>;
};

function collectMarkers(lines: string[]): MarkerEntry[] {
  const markers: MarkerEntry[] = [];
  let section: SmartPasteSection = "main";

  lines.forEach((rawLine, lineIndex) => {
    const line = normalizePasteLine(rawLine);
    const sectionSwitch = matchSectionMarker(line);
    if (sectionSwitch) {
      section = sectionSwitch;
      markers.push({ lineIndex, match: { type: "section", section } });
      return;
    }

    const labelMatch = matchLabelLine(line, section);
    if (labelMatch) {
      if (labelMatch.type === "section") {
        section = labelMatch.section;
      }
      markers.push({ lineIndex, match: labelMatch });
    }
  });

  return markers;
}

function extractValue(lines: string[], startIndex: number, endIndex: number): string {
  const slice = lines.slice(startIndex + 1, endIndex);
  return joinParagraphs(slice.map((line) => line.replace(/\r/g, "")));
}

function setMainField(data: CategorySmartPasteData, key: string, value: string) {
  if (!value.trim()) return;
  switch (key) {
    case "name":
      data.name = value.trim();
      break;
    case "slug":
      data.slug = value.trim();
      break;
    case "description":
      data.description = value;
      break;
    case "introduction":
      data.introduction = value;
      break;
    case "bottomContent":
      data.bottomContent = value;
      break;
    default:
      break;
  }
}

function ensureFaqItem(map: Map<number, ParsedFaqItem>, index: number): ParsedFaqItem {
  const existing = map.get(index);
  if (existing) return existing;
  const created = { index };
  map.set(index, created);
  return created;
}

function buildFaqItems(map: Map<number, ParsedFaqItem>): ParsedFaqItem[] {
  return [...map.values()].sort((a, b) => a.index - b.index);
}

function countResolvedFields(data: CategorySmartPasteData): number {
  let count = 0;
  if (data.name) count += 1;
  if (data.slug) count += 1;
  if (data.description) count += 1;
  if (data.introduction) count += 1;
  if (data.bottomContent) count += 1;
  if (data.faqKicker) count += 1;
  if (data.faqTitle) count += 1;
  if (data.faqLead) count += 1;
  count += data.faqItems.filter((item) => item.question && item.answer).length;
  if (data.ctaTitle) count += 1;
  if (data.ctaBody) count += 1;
  if (data.ctaButtonLabel) count += 1;
  if (data.ctaButtonHref) count += 1;
  return count;
}

export function parseCategorySmartPaste(text: string): CategorySmartPastePreview {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const markers = collectMarkers(lines);

  const data: CategorySmartPasteData = { faqItems: [] };
  const foundFields: SmartPasteFieldKey[] = [];
  const unknownHeadings: string[] = [];
  const warnings: string[] = [];
  const faqMap = new Map<number, ParsedFaqItem>();

  for (let i = 0; i < markers.length; i += 1) {
    const { lineIndex, match } = markers[i]!;
    if (!match || match.type === "section") continue;

    if (match.type === "unknown") {
      unknownHeadings.push(match.rawLabel);
      continue;
    }

    const nextMarkerLine = markers[i + 1]?.lineIndex ?? lines.length;
    const value = extractValue(lines, lineIndex, nextMarkerLine);
    if (!value.trim()) continue;

    const key = match.key;

    if (key.startsWith("faqQuestion:")) {
      const index = Number(key.split(":")[1]);
      const item = ensureFaqItem(faqMap, index);
      item.question = value;
      foundFields.push(`faqQuestion:${index}` as SmartPasteFieldKey);
      continue;
    }

    if (key.startsWith("faqAnswer:")) {
      const index = Number(key.split(":")[1]);
      const item = ensureFaqItem(faqMap, index);
      item.answer = value;
      foundFields.push(`faqAnswer:${index}` as SmartPasteFieldKey);
      continue;
    }

    switch (key) {
      case "name":
      case "slug":
      case "description":
      case "introduction":
      case "bottomContent":
        setMainField(data, key, value);
        foundFields.push(key);
        break;
      case "faqKicker":
        data.faqKicker = value;
        foundFields.push("faqKicker");
        break;
      case "faqTitle":
        data.faqTitle = value;
        foundFields.push("faqTitle");
        break;
      case "faqLead":
        data.faqLead = value;
        foundFields.push("faqLead");
        break;
      case "ctaTitle":
        data.ctaTitle = value;
        foundFields.push("ctaTitle");
        break;
      case "ctaBody":
        data.ctaBody = value;
        foundFields.push("ctaBody");
        break;
      case "ctaButtonLabel":
        data.ctaButtonLabel = value.trim();
        foundFields.push("ctaButtonLabel");
        break;
      case "ctaButtonHref":
        data.ctaButtonHref = value.trim();
        foundFields.push("ctaButtonHref");
        break;
      default:
        unknownHeadings.push(match.rawLabel);
        break;
    }
  }

  for (const item of buildFaqItems(faqMap)) {
    if (item.question && !item.answer) {
      warnings.push(`שאלה ${item.index} ללא תשובה — לא נוספה ל-FAQ.`);
    }
    if (item.answer && !item.question) {
      warnings.push(`תשובה ${item.index} ללא שאלה — לא נוספה ל-FAQ.`);
    }
  }

  data.faqItems = buildFaqItems(faqMap).filter(
    (item) => item.question?.trim() && item.answer?.trim()
  );

  const ctaDetected = Boolean(
    data.ctaTitle || data.ctaBody || data.ctaButtonLabel || data.ctaButtonHref
  );

  const fieldsCount = countResolvedFields(data);
  const faqPairCount = data.faqItems.length;
  const hasAnyField = fieldsCount > 0;

  if (!hasAnyField && unknownHeadings.length === 0 && text.trim()) {
    warnings.push("לא הצלחנו לזהות שדות בטקסט. יש לוודא שהכותרות תואמות לפורמט הנתמך.");
  }

  return {
    data,
    foundFields,
    unknownHeadings,
    warnings,
    fieldsCount,
    faqPairCount,
    ctaDetected,
    hasAnyField
  };
}
