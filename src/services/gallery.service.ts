import { deleteGalleryItem, getGalleryItems, saveGalleryItem } from "@/repositories/gallery.repository";
import type { GalleryItem } from "@/types/content";

export async function listGalleryItems(
  options: { activeOnly?: boolean } = {}
): Promise<GalleryItem[]> {
  const items = await getGalleryItems();
  return items
    .filter((item) => (options.activeOnly ? item.isActive : true))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function upsertGalleryItem(input: GalleryItem): Promise<GalleryItem> {
  return saveGalleryItem({ ...input, updatedAt: new Date().toISOString() });
}

export async function removeGalleryItem(id: string): Promise<boolean> {
  return deleteGalleryItem(id);
}
