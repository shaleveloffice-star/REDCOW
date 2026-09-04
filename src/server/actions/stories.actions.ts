"use server";

import { materializeMenuImageUrl } from "@/lib/admin/save-menu-image";
import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { resolveStorySlug, normalizeStorySlug } from "@/lib/stories/story-slug";
import { assertSafeHttpUrl, sanitizePublicHref } from "@/lib/security/safe-url";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import {
  listBrandStories,
  removeBrandStory,
  upsertBrandStory
} from "@/services/stories.service";
import type { BrandStory, StorySection } from "@/types/story";

const paths = ["/admin/stories", "/stories"];

function revalidateStoryCaches(story: BrandStory, previousSlug?: string) {
  revalidateTag(CACHE_TAGS.brandStories, "max");
  for (const path of paths) {
    revalidatePath(path);
  }
  const canonicalSlug = resolveStorySlug(story);
  revalidatePath(`/stories/${canonicalSlug}`);
  const prev = previousSlug ? normalizeStorySlug(previousSlug) : "";
  if (prev && prev !== canonicalSlug) {
    revalidatePath(`/stories/${prev}`);
  }
}

export type SaveBrandStoryResult =
  | { ok: true; story: BrandStory }
  | { ok: false; error: string };

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
}

function formatSaveError(err: unknown): string {
  const detail = err instanceof Error ? err.message : String(err ?? "unknown");
  const trimmed = detail.replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed === "unknown") {
    return "שמירת הסיפור נכשלה. נסו שוב.";
  }
  const short = trimmed.length > 400 ? `${trimmed.slice(0, 400)}…` : trimmed;
  if (
    short.startsWith("שמירת") ||
    short.startsWith("אין") ||
    short.startsWith("כותרת") ||
    short.startsWith("Slug") ||
    short.startsWith("קישור") ||
    short.startsWith("תמונ") ||
    short.startsWith("לא") ||
    short.startsWith("Firebase") ||
    short.startsWith("Firestore")
  ) {
    return short;
  }
  return `שמירת הסיפור נכשלה: ${short}`;
}

async function materializeImageUrl(
  imageUrl: string,
  fieldLabel: string,
  options?: { optional?: boolean }
): Promise<string> {
  const safe = assertSafeHttpUrl(imageUrl, fieldLabel);
  if (!safe) {
    if (options?.optional) {
      return "";
    }
    throw new Error(`${fieldLabel}: כתובת תמונה נדרשת`);
  }
  const materialized = await materializeMenuImageUrl(safe);
  if (!materialized.ok) {
    throw new Error(`${fieldLabel}: ${materialized.error}`);
  }
  return materialized.url;
}

async function sanitizeSection(section: StorySection): Promise<StorySection> {
  const background =
    section.background === "light" || section.background === "dark" ? section.background : undefined;

  switch (section.type) {
    case "split-text-image":
    case "split-image-text":
      return omitUndefined({
        type: section.type,
        background,
        kicker: section.kicker?.trim() || undefined,
        title: section.title.trim(),
        body: section.body.trim(),
        imageUrl: await materializeImageUrl(section.imageUrl, "תמונת מקטע", { optional: true }),
        imageAlt: section.imageAlt.trim()
      }) as StorySection;
    case "full-image":
      return omitUndefined({
        type: section.type,
        background,
        imageUrl: await materializeImageUrl(section.imageUrl, "תמונת מקטע", { optional: true }),
        imageAlt: section.imageAlt.trim(),
        caption: section.caption?.trim() || undefined
      }) as StorySection;
    case "quote":
      return omitUndefined({
        type: section.type,
        background,
        text: section.text.trim(),
        attribution: section.attribution?.trim() || undefined
      }) as StorySection;
    case "cta": {
      const href = sanitizePublicHref(section.href.trim());
      if (!href) {
        throw new Error("קישור CTA לא תקין");
      }
      return omitUndefined({
        type: section.type,
        background,
        body: section.body?.trim() || undefined,
        label: section.label.trim(),
        href
      }) as StorySection;
    }
    case "long-content":
      return omitUndefined({
        type: section.type,
        background,
        kicker: section.kicker?.trim() || undefined,
        title: section.title?.trim() || undefined,
        body: section.body.trim(),
        textAlign:
          section.textAlign === "center" || section.textAlign === "left" || section.textAlign === "right"
            ? section.textAlign
            : undefined
      }) as StorySection;
    default:
      return section;
  }
}

async function sanitizeStory(input: BrandStory): Promise<BrandStory> {
  const slug = resolveStorySlug(input);
  if (!slug) {
    throw new Error("Slug נדרש");
  }

  const heroImageUrl = await materializeImageUrl(input.heroImageUrl, "תמונת Hero", {
    optional: true
  });
  const ogRaw = input.ogImageUrl?.trim();
  const ogImageUrl = ogRaw
    ? await materializeImageUrl(ogRaw, "תמונת OG")
    : undefined;

  const sections = await Promise.all((input.sections ?? []).map(sanitizeSection));

  return omitUndefined({
    ...input,
    slug,
    category: input.category.trim(),
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    heroImageUrl,
    heroImageAlt: input.heroImageAlt.trim(),
    metaTitle: input.metaTitle?.trim() || undefined,
    metaDescription: input.metaDescription?.trim() || undefined,
    ogImageUrl,
    sections,
    isActive: Boolean(input.isActive),
    showInMagazine: Boolean(input.isActive) && input.showInMagazine !== false,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    publishedAt: input.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }) as BrandStory;
}

export async function getStoriesAdminData() {
  await requireAdmin();
  return listBrandStories();
}

export async function saveBrandStoryAction(input: BrandStory): Promise<SaveBrandStoryResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "אין הרשאת אדמין. התחברו מחדש ל־/admin/login" };
  }

  try {
    if (!input?.title?.trim()) {
      return { ok: false, error: "כותרת נדרשת" };
    }

    const saved = await upsertBrandStory(await sanitizeStory(input));
    revalidateStoryCaches(saved, input.slug);
    return { ok: true, story: saved };
  } catch (err) {
    console.error("[saveBrandStoryAction]", err);
    return { ok: false, error: formatSaveError(err) };
  }
}

export async function deleteBrandStoryAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const existing = (await listBrandStories()).find((story) => story.id === id);
  const ok = await removeBrandStory(id);
  if (!ok) throw new Error("הסיפור לא נמצא");
  if (existing) {
    revalidateStoryCaches(existing);
  } else {
    revalidateTag(CACHE_TAGS.brandStories, "max");
    paths.forEach((path) => revalidatePath(path));
  }
}

export async function toggleStoryMagazineAction(
  id: string,
  showInMagazine: boolean
): Promise<SaveBrandStoryResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "אין הרשאת אדמין. התחברו מחדש ל־/admin/login" };
  }

  const stories = await listBrandStories();
  const story = stories.find((entry) => entry.id === id);
  if (!story) {
    return { ok: false, error: "הסיפור לא נמצא" };
  }

  if (showInMagazine && !story.isActive) {
    return { ok: false, error: "יש לפרסם את הסיפור לפני הצגה במגזין" };
  }

  return saveBrandStoryAction({
    ...story,
    showInMagazine
  });
}
