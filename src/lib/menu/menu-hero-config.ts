import { HERO_DEFAULT_POSTER_URL, HERO_DEFAULT_VIDEO_URL } from "@/data/site-images.registry";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import type { MenuHeroConfig, MenuHeroInput } from "@/types/menu-hero";

export const DEFAULT_MENU_HERO: MenuHeroConfig = {
  mediaType: "video",
  imageUrl: HERO_DEFAULT_POSTER_URL,
  videoUrl: HERO_DEFAULT_VIDEO_URL,
  posterUrl: HERO_DEFAULT_POSTER_URL,
  alt: "",
  desktopHeight: 420,
  mobileHeight: 260,
  updatedAt: new Date(0).toISOString()
};

export const MENU_HERO_HEIGHT_LIMITS = {
  desktop: { min: 240, max: 800 },
  mobile: { min: 180, max: 600 }
} as const;

function mediaUrl(value: unknown, label: string, video: boolean): string {
  if (typeof value !== "string" || value.length > 4096) throw new Error(`${label}: כתובת לא תקינה`);
  const url = assertSafeHttpUrl(value, label);
  if (url.startsWith("data:")) throw new Error(`${label}: יש להעלות תמונה דרך כפתור ההעלאה`);
  if (url && isVideoMediaUrl(url) !== video) {
    throw new Error(video ? "יש להזין קישור ישיר לקובץ וידאו MP4, WebM או MOV" : `${label}: נדרשת תמונה ולא וידאו`);
  }
  return url;
}

function height(value: unknown, device: keyof typeof MENU_HERO_HEIGHT_LIMITS): number {
  const { min, max } = MENU_HERO_HEIGHT_LIMITS[device];
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`גובה ${device === "mobile" ? "מובייל" : "מחשב"} חייב להיות מספר שלם בין ${min} ל־${max}`);
  }
  return value;
}

export function validateMenuHeroInput(input: unknown): MenuHeroInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("הגדרות באנר לא תקינות");
  const value = input as Record<string, unknown>;
  if (value.mediaType !== "none" && value.mediaType !== "image" && value.mediaType !== "video") {
    throw new Error("יש לבחור תמונה, וידאו או הסתרה");
  }
  const imageUrl = mediaUrl(value.imageUrl, "תמונת הבאנר", false);
  const videoUrl = mediaUrl(value.videoUrl, "וידאו הבאנר", true);
  const posterUrl = mediaUrl(value.posterUrl, "תמונת המתנה לווידאו", false);
  if (value.mediaType === "image" && !imageUrl) throw new Error("נדרשת תמונה להצגת הבאנר");
  if (value.mediaType === "video" && !videoUrl) throw new Error("נדרש קישור לווידאו להצגת הבאנר");
  if (typeof value.alt !== "string" || value.alt.length > 300) throw new Error("תיאור התמונה מוגבל ל־300 תווים");
  return {
    mediaType: value.mediaType,
    imageUrl,
    videoUrl,
    posterUrl,
    alt: value.alt.trim(),
    desktopHeight: height(value.desktopHeight, "desktop"),
    mobileHeight: height(value.mobileHeight, "mobile")
  };
}
