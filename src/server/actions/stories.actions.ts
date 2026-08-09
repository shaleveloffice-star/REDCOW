"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { resolveStorySlug } from "@/lib/stories/story-slug";
import { assertSafeHttpUrl, sanitizePublicHref } from "@/lib/security/safe-url";
import { revalidatePath } from "next/cache";
import {
  listBrandStories,
  removeBrandStory,
  upsertBrandStory
} from "@/services/stories.service";
import type { BrandStory, StorySection } from "@/types/story";

const paths = ["/admin/stories", "/stories"];

function sanitizeSection(section: StorySection): StorySection {
  switch (section.type) {
    case "split-text-image":
    case "split-image-text":
      return {
        type: section.type,
        kicker: section.kicker?.trim() || undefined,
        title: section.title.trim(),
        body: section.body.trim(),
        imageUrl: assertSafeHttpUrl(section.imageUrl, "תמונת מקטע"),
        imageAlt: section.imageAlt.trim()
      };
    case "full-image":
      return {
        type: section.type,
        imageUrl: assertSafeHttpUrl(section.imageUrl, "תמונת מקטע"),
        imageAlt: section.imageAlt.trim(),
        caption: section.caption?.trim() || undefined
      };
    case "quote":
      return {
        type: section.type,
        text: section.text.trim(),
        attribution: section.attribution?.trim() || undefined
      };
    case "cta": {
      const href = sanitizePublicHref(section.href.trim());
      if (!href) {
        throw new Error("קישור CTA לא תקין");
      }
      return {
        type: section.type,
        body: section.body?.trim() || undefined,
        label: section.label.trim(),
        href
      };
    }
    default:
      return section;
  }
}

function sanitizeStory(input: BrandStory): BrandStory {
  const slug = resolveStorySlug(input);
  if (!slug) {
    throw new Error("Slug נדרש");
  }

  return {
    ...input,
    slug,
    category: input.category.trim(),
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    heroImageUrl: assertSafeHttpUrl(input.heroImageUrl, "תמונת Hero"),
    heroImageAlt: input.heroImageAlt.trim(),
    metaTitle: input.metaTitle?.trim() || undefined,
    metaDescription: input.metaDescription?.trim() || undefined,
    ogImageUrl: input.ogImageUrl?.trim()
      ? assertSafeHttpUrl(input.ogImageUrl, "תמונת OG")
      : undefined,
    sections: (input.sections ?? []).map(sanitizeSection),
    isActive: Boolean(input.isActive),
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    publishedAt: input.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function getStoriesAdminData() {
  await requireAdmin();
  return listBrandStories();
}

export async function saveBrandStoryAction(input: BrandStory) {
  await requireAdmin();
  if (!input.title.trim()) throw new Error("כותרת נדרשת");
  const saved = await upsertBrandStory(sanitizeStory(input));
  paths.forEach((path) => revalidatePath(path));
  revalidatePath(`/stories/${saved.slug}`);
  return saved;
}

export async function deleteBrandStoryAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const ok = await removeBrandStory(id);
  if (!ok) throw new Error("הסיפור לא נמצא");
  paths.forEach((path) => revalidatePath(path));
}
