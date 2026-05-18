import { mockGalleryItems } from "@/data/mock/gallery.mock";
import type { GalleryItem } from "@/types/content";

export async function getGalleryItems(): Promise<GalleryItem[]> {
  return mockGalleryItems;
}

export async function saveGalleryItem(input: GalleryItem): Promise<GalleryItem> {
  return input;
}
