import {
  deleteGalleryImage,
  getGalleryImages,
  saveGalleryImage
} from "@/repositories/gallery.repository";
import type { GalleryImage } from "@/types/gallery";

export async function listGalleryImages(): Promise<GalleryImage[]> {
  const items = await getGalleryImages();
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function upsertGalleryImage(input: GalleryImage): Promise<GalleryImage> {
  return saveGalleryImage({ ...input, updatedAt: new Date().toISOString() });
}

export async function removeGalleryImage(id: string): Promise<boolean> {
  return deleteGalleryImage(id);
}
