"use server";

import { listGalleryItems, upsertGalleryItem } from "@/services/gallery.service";
import type { GalleryItem } from "@/types/content";

export async function getGalleryAdminData() {
  return listGalleryItems();
}

export async function saveGalleryItemAction(input: GalleryItem) {
  return upsertGalleryItem(input);
}
