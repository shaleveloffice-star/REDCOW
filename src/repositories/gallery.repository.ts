import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localGalleryImagesStore } from "@/lib/firebase/local-stores";
import type { GalleryImage } from "@/types/gallery";

const galleryStore = createFirestoreCollectionStore("galleryImages", localGalleryImagesStore, {
  access: "public",
  seed: []
});

export async function getGalleryImages(): Promise<GalleryImage[]> {
  return galleryStore.getAll();
}

export async function getGalleryImageById(id: string): Promise<GalleryImage | null> {
  return galleryStore.getById(id);
}

export async function saveGalleryImage(input: GalleryImage): Promise<GalleryImage> {
  return galleryStore.save(input);
}

export async function deleteGalleryImage(id: string): Promise<boolean> {
  return galleryStore.remove(id);
}
