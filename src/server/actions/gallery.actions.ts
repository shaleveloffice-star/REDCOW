"use server";

import { revalidatePath } from "next/cache";
import { listGalleryItems, removeGalleryItem, upsertGalleryItem } from "@/services/gallery.service";
import type { GalleryItem } from "@/types/content";

const paths = ["/admin/gallery", "/"];

export async function getGalleryAdminData() {
  return listGalleryItems();
}

export async function saveGalleryItemAction(input: GalleryItem) {
  if (!input.title.trim()) throw new Error("כותרת נדרשת");
  const saved = await upsertGalleryItem({
    ...input,
    title: input.title.trim(),
    imageUrl: input.imageUrl.trim(),
    alt: input.alt.trim(),
    category: input.category.trim(),
    isActive: Boolean(input.isActive)
  });
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deleteGalleryItemAction(id: string) {
  const ok = await removeGalleryItem(id);
  if (!ok) throw new Error("הפריט לא נמצא");
  paths.forEach((path) => revalidatePath(path));
}
