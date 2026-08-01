import type { SeoContentDocument, SeoLocaleBundle, SeoPageFieldsInput } from "@/types/seo-content";

function toIsoTimestamp(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return new Date().toISOString();
}

/** Remove undefined values so Firestore + Server Action responses stay serializable. */
export function sanitizeSeoStorageValue<T>(value: T): T {
  if (value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeSeoStorageValue(entry)) as T;
  }

  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) {
        output[key] = sanitizeSeoStorageValue(entry);
      }
    }
    return output as T;
  }

  return value;
}

export function sanitizeSeoPageFields(fields: SeoPageFieldsInput | undefined): SeoPageFieldsInput {
  return sanitizeSeoStorageValue(fields ?? {});
}

export function sanitizeSeoLocaleBundle(bundle: SeoLocaleBundle): SeoLocaleBundle {
  const pages = bundle.pages ?? {};
  const sanitizedPages = Object.fromEntries(
    Object.entries(pages).map(([pageId, fields]) => [pageId, sanitizeSeoPageFields(fields)])
  ) as SeoLocaleBundle["pages"];

  return {
    pages: sanitizedPages,
    updatedAt: toIsoTimestamp(bundle.updatedAt)
  };
}

export function sanitizeSeoContentDocument(document: SeoContentDocument): SeoContentDocument {
  const output: SeoContentDocument = {};
  for (const [locale, bundle] of Object.entries(document)) {
    if (bundle) {
      output[locale as keyof SeoContentDocument] = sanitizeSeoLocaleBundle(bundle);
    }
  }
  return output;
}

export function mergeSeoPageFields(
  current: SeoPageFieldsInput | undefined,
  incoming: SeoPageFieldsInput | undefined
): SeoPageFieldsInput {
  const base = current ?? {};
  const patch = incoming ?? {};

  return sanitizeSeoPageFields({
    ...base,
    ...patch,
    faq: patch.faq !== undefined ? patch.faq : base.faq,
    cta: patch.cta !== undefined ? patch.cta : base.cta,
    categoryIntros:
      patch.categoryIntros !== undefined
        ? { ...(base.categoryIntros ?? {}), ...patch.categoryIntros }
        : base.categoryIntros,
    categoryPages:
      patch.categoryPages !== undefined
        ? { ...(base.categoryPages ?? {}), ...patch.categoryPages }
        : base.categoryPages
  });
}
