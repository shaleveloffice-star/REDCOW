import { isVideoMediaUrl } from "@/lib/menu-media";

/** Social post URLs are not video files and cannot be used as native autoplay sources. */
export function getRecommendationPreviewVideo(item: { mediaUrl?: string; contentUrl?: string }): string {
  return [item.mediaUrl, item.contentUrl].map((url) => url?.trim() || "").find((url) => isVideoMediaUrl(url)) || "";
}
