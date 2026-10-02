"use server";

import { requireAdmin, requireAdminRole } from "@/lib/auth/admin-guard";
import { createId } from "@/lib/admin/new-id";
import { stripMenuItemImages } from "@/lib/admin/strip-menu-item-images";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { revalidatePath, updateTag } from "next/cache";
import {
  listGalleryImages,
  removeGalleryImage,
  upsertGalleryImage
} from "@/services/gallery.service";
import { listMenuItems, upsertMenuItem } from "@/services/menu.service";
import type { GalleryImage } from "@/types/gallery";

const paths = ["/admin/gallery", "/admin/stories"];

function sanitizeGalleryImage(input: GalleryImage): GalleryImage {
  return {
    ...input,
    title: input.title.trim(),
    imageUrl: input.imageUrl.trim(),
    alt: input.alt?.trim() || undefined,
    fileName: input.fileName?.trim() || undefined,
    updatedAt: new Date().toISOString()
  };
}

export async function getGalleryAdminData() {
  await requireAdmin();
  return listGalleryImages();
}

export async function createGalleryImageAction(input: {
  title: string;
  imageUrl: string;
  alt?: string;
  fileName?: string;
}) {
  await requireAdmin();
  if (!input.imageUrl.trim()) {
    throw new Error("כתובת תמונה נדרשת");
  }

  const now = new Date().toISOString();
  const saved = await upsertGalleryImage(
    sanitizeGalleryImage({
      id: createId("gallery"),
      title: input.title.trim() || "תמונה מהגלריה",
      imageUrl: input.imageUrl,
      alt: input.alt,
      fileName: input.fileName,
      createdAt: now,
      updatedAt: now
    })
  );

  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function updateGalleryImageAction(input: GalleryImage) {
  await requireAdmin();
  const saved = await upsertGalleryImage(sanitizeGalleryImage(input));
  paths.forEach((path) => revalidatePath(path));
  return saved;
}

export async function deleteGalleryImageAction(id: string) {
  await requireAdminRole(["owner", "manager"]);
  const ok = await removeGalleryImage(id);
  if (!ok) throw new Error("התמונה לא נמצאה");
  paths.forEach((path) => revalidatePath(path));
}

const MAX_BULK_DELETE = 200;

export async function deleteGalleryImagesAction(ids: string[]) {
  await requireAdminRole(["owner", "manager"]);
  if (!Array.isArray(ids)) throw new Error("רשימת תמונות לא תקינה");
  const uniqueIds = [...new Set(ids.filter((id) => typeof id === "string" && id.trim()))];
  if (uniqueIds.length === 0) throw new Error("לא נבחרו תמונות");
  if (uniqueIds.length > MAX_BULK_DELETE) {
    throw new Error(`אפשר למחוק עד ${MAX_BULK_DELETE} תמונות בפעם אחת`);
  }

  let deleted = 0;
  for (const id of uniqueIds) {
    if (await removeGalleryImage(id)) deleted += 1;
  }
  paths.forEach((path) => revalidatePath(path));
  return { deleted, missing: uniqueIds.length - deleted };
}

/** Removes images everywhere they are stored: menu items (primary, close-up, extra) and gallery records. */
export async function deleteSiteImagesByUrlAction(urls: string[]) {
  await requireAdminRole(["owner", "manager"]);
  if (!Array.isArray(urls)) throw new Error("רשימת תמונות לא תקינה");
  const uniqueUrls = new Set(
    urls.filter((url): url is string => typeof url === "string" && Boolean(url.trim())).map((url) => url.trim())
  );
  if (uniqueUrls.size === 0) throw new Error("לא נבחרו תמונות");
  if (uniqueUrls.size > MAX_BULK_DELETE) {
    throw new Error(`אפשר למחוק עד ${MAX_BULK_DELETE} תמונות בפעם אחת`);
  }

  const [menuItems, galleryImages] = await Promise.all([listMenuItems(), listGalleryImages()]);

  let menuItemsUpdated = 0;
  for (const item of menuItems) {
    const stripped = stripMenuItemImages(item, uniqueUrls);
    if (!stripped) continue;
    await upsertMenuItem(stripped);
    menuItemsUpdated += 1;
  }

  let galleryRemoved = 0;
  for (const image of galleryImages) {
    if (!uniqueUrls.has(image.imageUrl.trim())) continue;
    if (await removeGalleryImage(image.id)) galleryRemoved += 1;
  }

  paths.forEach((path) => revalidatePath(path));
  ["/admin/menu", "/"].forEach((path) => revalidatePath(path));
  revalidatePath("/menu", "layout");
  try {
    updateTag(CACHE_TAGS.homepageMenu);
    updateTag(CACHE_TAGS.menuCategories);
    updateTag(CACHE_TAGS.menuDisplay);
  } catch {
    // data is already saved; cache refresh is best-effort
  }

  return { images: uniqueUrls.size, menuItemsUpdated, galleryRemoved };
}
