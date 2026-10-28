import "server-only";

import { revalidatePath } from "next/cache";

import { createId } from "@/lib/admin/new-id";
import { getGalleryImages, saveGalleryImage } from "@/repositories/gallery.repository";

const DEFAULT_TITLE = "תמונה שהועלתה";
const MAX_TITLE_LENGTH = 120;

export function galleryTitleFromUpload(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_TITLE;
  const title = raw
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TITLE_LENGTH);
  return title || DEFAULT_TITLE;
}

function normalizeGalleryUrl(url: string): string {
  return url.trim().split(/[?#]/)[0] ?? url.trim();
}

/** Every admin upload is also listed in the gallery; a failure here must not fail the upload itself. */
export async function registerUploadInGallery(input: {
  url: string;
  fileName?: string;
  title?: unknown;
  strict?: boolean;
}): Promise<void> {
  try {
    const url = input.url.trim();
    if (!url || url.startsWith("data:") || url.startsWith("blob:")) {
      if (input.strict) throw new Error("כתובת מדיה לא תקינה לרישום בגלריה");
      return;
    }

    const title = galleryTitleFromUpload(input.title);
    const now = new Date().toISOString();
    const existing = (await getGalleryImages()).find(
      (item) => normalizeGalleryUrl(item.imageUrl) === normalizeGalleryUrl(url)
    );

    await saveGalleryImage({
      id: existing?.id ?? createId("gallery"),
      title: existing?.title?.trim() || title,
      alt: existing?.alt?.trim() || title,
      imageUrl: url,
      fileName: input.fileName || existing?.fileName,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/admin/stories");
    revalidatePath("/admin/recommendations");
    revalidatePath("/admin/pages/home");
    revalidatePath("/admin/menu");
  } catch (err) {
    if (input.strict) throw err;
    console.warn(
      "[registerUploadInGallery] failed:",
      err instanceof Error ? err.message : err
    );
  }
}
