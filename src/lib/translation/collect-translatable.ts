import { shouldSkipTranslation } from "@/lib/translation/protect-terms";

export const SKIP_OBJECT_KEYS = new Set([
  "buttonHref",
  "href",
  "slug",
  "id",
  "categoryId",
  "imageUrl",
  "closeUpImageUrl",
  "galleryUrls",
  "imageAlt",
  "path",
  "url",
  "price",
  "sortOrder",
  "isActive",
  "showInMagazine",
  "createdAt",
  "updatedAt",
  "tags",
  "primaryKeyword"
]);

export function collectTranslatableStrings(value: unknown, key?: string, bucket?: Set<string>): Set<string> {
  const strings = bucket ?? new Set<string>();

  if (typeof value === "string") {
    if (key && SKIP_OBJECT_KEYS.has(key)) {
      return strings;
    }
    const trimmed = value.trim();
    if (trimmed && !shouldSkipTranslation(trimmed)) {
      strings.add(value);
    }
    return strings;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectTranslatableStrings(entry, undefined, strings);
    }
    return strings;
  }

  if (value && typeof value === "object") {
    for (const [entryKey, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (SKIP_OBJECT_KEYS.has(entryKey)) {
        continue;
      }
      collectTranslatableStrings(entryValue, entryKey, strings);
    }
  }

  return strings;
}

export function applyTranslatedStrings<T>(
  value: T,
  translations: Map<string, string>,
  key?: string
): T {
  if (typeof value === "string") {
    if (key && SKIP_OBJECT_KEYS.has(key)) {
      return value;
    }
    return (translations.get(value) ?? value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => applyTranslatedStrings(entry, translations)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [
      entryKey,
      SKIP_OBJECT_KEYS.has(entryKey)
        ? entryValue
        : applyTranslatedStrings(entryValue, translations, entryKey)
    ]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}
