import type { MenuItem } from "@/types/content";

/** Returns the item without the given image URLs, or null when nothing referenced them. */
export function stripMenuItemImages(item: MenuItem, urls: ReadonlySet<string>): MenuItem | null {
  const matches = (value: string | undefined) => Boolean(value?.trim() && urls.has(value.trim()));

  const clearPrimary = matches(item.imageUrl);
  const clearCloseUp = matches(item.closeUpImageUrl);
  const galleryUrls = item.galleryUrls?.filter((url) => !matches(url));
  const galleryChanged = (galleryUrls?.length ?? 0) !== (item.galleryUrls?.length ?? 0);

  if (!clearPrimary && !clearCloseUp && !galleryChanged) return null;

  return {
    ...item,
    imageUrl: clearPrimary ? "" : item.imageUrl,
    closeUpImageUrl: clearCloseUp ? "" : item.closeUpImageUrl,
    galleryUrls
  };
}
