import "server-only";

import { revalidatePath } from "next/cache";

import { createId } from "@/lib/admin/new-id";
import { upsertGalleryImage } from "@/services/gallery.service";

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

/** Every admin upload is also listed in the gallery; a failure here must not fail the upload itself. */
export async function registerUploadInGallery(input: {
  url: string;
  fileName?: string;
  title?: unknown;
}): Promise<void> {
  try {
    const title = galleryTitleFromUpload(input.title);
    const now = new Date().toISOString();
    await upsertGalleryImage({
      id: createId("gallery"),
      title,
      alt: title,
      imageUrl: input.url,
      fileName: input.fileName,
      createdAt: now,
      updatedAt: now
    });
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/stories");
  } catch (err) {
    console.warn(
      "[registerUploadInGallery] failed:",
      err instanceof Error ? err.message : err
    );
  }
}
