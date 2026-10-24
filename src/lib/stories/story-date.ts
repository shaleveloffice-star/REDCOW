import type { BrandStory } from "@/types/story";

/** Prefer the later of publishedAt / updatedAt as the public "last published" date. */
export function resolveStoryLastPublishedAt(
  story: Pick<BrandStory, "publishedAt" | "updatedAt">
): string | null {
  const candidates = [story.publishedAt, story.updatedAt]
    .map((value) => String(value ?? "").trim())
    .filter((value) => Number.isFinite(Date.parse(value)));
  if (!candidates.length) return null;
  return candidates.sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
}

export function formatStoryDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return "";
  }
}

export function storyDateLocale(locale: string): string {
  if (locale === "he") return "he-IL";
  if (locale === "fr") return "fr-FR";
  return "en-US";
}
