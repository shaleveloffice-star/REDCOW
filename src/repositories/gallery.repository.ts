import { mockGalleryItems } from "@/data/mock/gallery.mock";
import { createInMemoryStore } from "@/lib/admin/in-memory-store";
import type { GalleryItem } from "@/types/content";

const galleryStore = createInMemoryStore(mockGalleryItems);

export async function getGalleryItems(): Promise<GalleryItem[]> {
  return galleryStore.getAll();
}

export async function saveGalleryItem(input: GalleryItem): Promise<GalleryItem> {
  return galleryStore.save(input);
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  return galleryStore.remove(id);
}
