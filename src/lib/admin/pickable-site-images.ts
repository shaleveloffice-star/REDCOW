import {
  formatAdminImageSpec,
  getAdminImageSpec,
  type AdminImageSpec
} from "@/data/admin-image-specs";
import { STATIC_SITE_IMAGE_GROUPS } from "@/data/site-images.registry";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { pickSiteImage } from "@/lib/site-image-url";
import type { MenuItem } from "@/types/content";
import type { GalleryImage } from "@/types/gallery";
import type { SiteImagesMap } from "@/types/site-images";

export type AdminPickableImageSource = "site" | "menu" | "gallery";

export type AdminPickableImage = {
  id: string;
  label: string;
  location: string;
  imageUrl: string;
  group: string;
  source: AdminPickableImageSource;
  /** ISO upload time when known; bundled design images have none. */
  uploadedAt?: string;
  spec: AdminImageSpec;
  recommendedSizeLabel: string;
};

/** Upload file names embed Date.now(), e.g. gal-1790920609535-x6bx7ebv.jpg. */
const UPLOAD_TIMESTAMP_PATTERN = /[-_](\d{13})(?=[-_.])/;
const MIN_UPLOAD_TIMESTAMP = Date.UTC(2020, 0, 1);
const MAX_UPLOAD_TIMESTAMP = Date.UTC(2100, 0, 1);

export function uploadedAtFromUrl(url: string): string | undefined {
  const fileName = url.split("?")[0].split("/").pop() ?? "";
  const match = UPLOAD_TIMESTAMP_PATTERN.exec(fileName);
  if (!match) return undefined;
  const timestamp = Number(match[1]);
  if (timestamp < MIN_UPLOAD_TIMESTAMP || timestamp > MAX_UPLOAD_TIMESTAMP) return undefined;
  return new Date(timestamp).toISOString();
}

/** Newest upload first; images without a known upload time keep their order at the end. */
export function sortPickableImagesByUploadDate(images: AdminPickableImage[]): AdminPickableImage[] {
  return images
    .map((image, index) => ({ image, index, time: image.uploadedAt ? Date.parse(image.uploadedAt) : NaN }))
    .sort((a, b) => {
      const aKnown = !Number.isNaN(a.time);
      const bKnown = !Number.isNaN(b.time);
      if (aKnown && bKnown && a.time !== b.time) return b.time - a.time;
      if (aKnown !== bKnown) return aKnown ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ image }) => image);
}

export function buildAdminPickableImages(
  siteImagesMap: SiteImagesMap,
  menuItems: MenuItem[] = [],
  galleryImages: GalleryImage[] = []
): AdminPickableImage[] {
  const seen = new Set<string>();
  const result: AdminPickableImage[] = [];
  const galleryUploadedAt = new Map(
    galleryImages
      .filter((image) => image.imageUrl?.trim() && image.createdAt)
      .map((image) => [image.imageUrl.trim(), image.createdAt])
  );
  const uploadedAtFor = (url: string) => galleryUploadedAt.get(url) ?? uploadedAtFromUrl(url);

  for (const group of STATIC_SITE_IMAGE_GROUPS) {
    for (const item of group.items) {
      const url = pickSiteImage(siteImagesMap, item.id, item.imageUrl);
      if (!url || isVideoMediaUrl(url) || seen.has(url)) {
        continue;
      }

      const spec = getAdminImageSpec(item.id);
      seen.add(url);
      result.push({
        id: item.id,
        label: item.label,
        location: item.location,
        imageUrl: url,
        group: group.title,
        source: "site",
        uploadedAt: uploadedAtFor(url),
        spec,
        recommendedSizeLabel: formatAdminImageSpec(spec)
      });
    }
  }

  for (const item of menuItems) {
    const url = item.imageUrl?.trim();
    if (!url || isVideoMediaUrl(url) || seen.has(url)) {
      continue;
    }

    const spec = getAdminImageSpec(`menu-${item.id}`);
    seen.add(url);
    result.push({
      id: `menu-${item.id}`,
      label: item.name,
      location: "תמונת מנה",
      imageUrl: url,
      group: "תפריט",
      source: "menu",
      uploadedAt: uploadedAtFor(url),
      spec,
      recommendedSizeLabel: formatAdminImageSpec(spec)
    });
  }

  for (const item of galleryImages) {
    const url = item.imageUrl?.trim();
    if (!url || isVideoMediaUrl(url) || seen.has(url)) {
      continue;
    }

    const spec = getAdminImageSpec(`gallery-${item.id}`);
    seen.add(url);
    result.push({
      id: `gallery-${item.id}`,
      label: item.title,
      location: item.alt?.trim() || "גלריה",
      imageUrl: url,
      group: "גלריה",
      source: "gallery",
      uploadedAt: uploadedAtFor(url),
      spec,
      recommendedSizeLabel: formatAdminImageSpec(spec)
    });
  }

  return result;
}
