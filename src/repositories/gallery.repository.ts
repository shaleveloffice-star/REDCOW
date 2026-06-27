import { mockGalleryItems } from "@/data/mock/gallery.mock";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localGalleryStore } from "@/lib/firebase/local-stores";
import type { GalleryItem } from "@/types/content";

const galleryStore = createFirestoreCollectionStore(
  "galleryItems",
  localGalleryStore,
  mockGalleryItems
);

export async function getGalleryItems(): Promise<GalleryItem[]> {
  return galleryStore.getAll();
}

export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  return galleryStore.getById(id);
}

export async function saveGalleryItem(input: GalleryItem): Promise<GalleryItem> {
  return galleryStore.save(input);
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  return galleryStore.remove(id);
}
