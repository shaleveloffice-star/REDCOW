import {
  joinParagraphs,
  matchLabelLine,
  normalizePasteLine,
  parsePriceValue,
  parseSortOrderValue,
  parseTagsValue
} from "./labels";
import type {
  MenuItemSmartPasteData,
  MenuItemSmartPasteFieldKey,
  MenuItemSmartPastePreview
} from "./types";

type MarkerEntry = {
  lineIndex: number;
  match: ReturnType<typeof matchLabelLine>;
};

function collectMarkers(lines: string[]): MarkerEntry[] {
  const markers: MarkerEntry[] = [];

  lines.forEach((rawLine, lineIndex) => {
    const labelMatch = matchLabelLine(normalizePasteLine(rawLine));
    if (labelMatch) {
      markers.push({ lineIndex, match: labelMatch });
    }
  });

  return markers;
}

function extractValue(lines: string[], startIndex: number, endIndex: number): string {
  const slice = lines.slice(startIndex + 1, endIndex);
  return joinParagraphs(slice.map((line) => line.replace(/\r/g, "")));
}

function countResolvedFields(data: MenuItemSmartPasteData): number {
  let count = 0;
  if (data.name) count += 1;
  if (data.category) count += 1;
  if (data.price !== undefined) count += 1;
  if (data.description) count += 1;
  if (data.longDescription) count += 1;
  if (data.imageAlt) count += 1;
  if (data.primaryKeyword) count += 1;
  if (data.metaTitle) count += 1;
  if (data.metaDescription) count += 1;
  if (data.slug) count += 1;
  if (data.sortOrder !== undefined) count += 1;
  if (data.tags && data.tags.length > 0) count += 1;
  return count;
}

export function parseMenuItemSmartPaste(text: string): MenuItemSmartPastePreview {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const markers = collectMarkers(lines);

  const data: MenuItemSmartPasteData = {};
  const foundFields: MenuItemSmartPasteFieldKey[] = [];
  const unknownHeadings: string[] = [];
  const warnings: string[] = [];

  for (let i = 0; i < markers.length; i += 1) {
    const { lineIndex, match } = markers[i]!;
    if (!match || match.type === "unknown") {
      if (match?.type === "unknown") {
        unknownHeadings.push(match.rawLabel);
      }
      continue;
    }

    const nextMarkerLine = markers[i + 1]?.lineIndex ?? lines.length;
    const value = extractValue(lines, lineIndex, nextMarkerLine);
    if (!value.trim() && match.key !== "price" && match.key !== "sortOrder") {
      continue;
    }

    switch (match.key) {
      case "name":
        data.name = value.trim();
        foundFields.push("name");
        break;
      case "category":
        data.category = value.trim();
        foundFields.push("category");
        break;
      case "price": {
        const price = parsePriceValue(value);
        if (price === undefined) {
          warnings.push("לא הצלחנו לזהות מחיר — השדה לא עודכן.");
        } else {
          data.price = price;
          foundFields.push("price");
        }
        break;
      }
      case "description":
        data.description = value;
        foundFields.push("description");
        break;
      case "longDescription":
        data.longDescription = value;
        foundFields.push("longDescription");
        break;
      case "imageAlt":
        data.imageAlt = value.trim();
        foundFields.push("imageAlt");
        break;
      case "primaryKeyword":
        data.primaryKeyword = value.trim();
        foundFields.push("primaryKeyword");
        break;
      case "metaTitle":
        data.metaTitle = value.trim();
        foundFields.push("metaTitle");
        break;
      case "metaDescription":
        data.metaDescription = value;
        foundFields.push("metaDescription");
        break;
      case "slug":
        data.slug = value.trim();
        foundFields.push("slug");
        break;
      case "sortOrder": {
        const sortOrder = parseSortOrderValue(value);
        if (sortOrder === undefined) {
          warnings.push("לא הצלחנו לזהות סדר תצוגה — השדה לא עודכן.");
        } else {
          data.sortOrder = sortOrder;
          foundFields.push("sortOrder");
        }
        break;
      }
      case "tags": {
        const tags = parseTagsValue(value);
        if (tags.length === 0) {
          warnings.push("לא זוהו תגיות — השדה לא עודכן.");
        } else {
          data.tags = tags;
          foundFields.push("tags");
        }
        break;
      }
      default:
        unknownHeadings.push(match.rawLabel);
        break;
    }
  }

  const fieldsCount = countResolvedFields(data);
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
    hasAnyField
  };
}
