import { isVideoMediaUrl } from "@/lib/menu-media";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import type {
  CreatorRecommendation,
  RecommendationMediaType,
  RecommendationPlatform,
  RecommendationTemplate,
  RecommendationsConfig,
  RecommendationsInput
} from "@/types/recommendations";

export const DEFAULT_RECOMMENDATIONS_CONFIG: RecommendationsConfig = {
  enabled: false,
  title: "ממליצים עלינו",
  introduction: "יוצרי תוכן שביקרו ב־SO WHAT, טעמו ושיתפו את החוויה שלהם.",
  items: [],
  updatedAt: new Date(0).toISOString()
};

const PLATFORMS: RecommendationPlatform[] = ["instagram", "tiktok", "youtube", "other"];
const MEDIA_TYPES: RecommendationMediaType[] = ["image", "video"];
const TEMPLATES: RecommendationTemplate[] = ["portrait", "quote", "media"];

function text(value: unknown, label: string, maxLength: number, required = false): string {
  if (typeof value !== "string") throw new Error(`${label}: ערך לא תקין`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new Error(`${label}: שדה חובה`);
  if (trimmed.length > maxLength) throw new Error(`${label}: עד ${maxLength} תווים`);
  return trimmed;
}

function url(value: unknown, label: string, required = false): string {
  const raw = text(value, label, 4096, required);
  if (!raw) return "";
  const safe = assertSafeHttpUrl(raw, label);
  if (safe.startsWith("data:")) throw new Error(`${label}: יש להעלות תמונה דרך כפתור ההעלאה`);
  return safe;
}

function enumValue<T extends string>(
  value: unknown,
  values: readonly T[],
  label: string
): T {
  if (!values.includes(value as T)) throw new Error(`${label}: בחירה לא תקינה`);
  return value as T;
}

function dateValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  const date = text(value, "תאריך ההמלצה", 10);
  const parsed = new Date(`${date}T00:00:00Z`);
  if (
    date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date)
  ) {
    throw new Error("תאריך ההמלצה לא תקין");
  }
  return date;
}

function validateItem(value: unknown, index: number): CreatorRecommendation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`המלצה ${index + 1}: נתונים לא תקינים`);
  }
  const item = value as Record<string, unknown>;
  const mediaType = enumValue(item.mediaType, MEDIA_TYPES, "סוג מדיה");
  const mediaUrl = url(item.mediaUrl, "מדיה", true);
  if (mediaType === "video" && !isVideoMediaUrl(mediaUrl)) {
    throw new Error("לווידאו יש להזין קישור ישיר לקובץ MP4, WebM או MOV");
  }
  if (mediaType === "image" && isVideoMediaUrl(mediaUrl)) {
    throw new Error("נבחרה תמונה אך הוזן קובץ וידאו");
  }

  const sortOrder = Number(item.sortOrder);
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 10_000) {
    throw new Error("סדר תצוגה לא תקין");
  }

  return {
    id: text(item.id, "מזהה", 160, true),
    creatorName: text(item.creatorName, "שם היוצר", 120, true),
    handle: text(item.handle, "שם משתמש", 120),
    quote: text(item.quote, "ציטוט", 1200),
    mediaType,
    mediaUrl,
    posterUrl: url(item.posterUrl, "תמונת המתנה"),
    mediaAlt: text(item.mediaAlt, "תיאור המדיה", 300),
    platform: enumValue(item.platform, PLATFORMS, "פלטפורמה"),
    profileUrl: url(item.profileUrl, "קישור לפרופיל"),
    contentUrl: url(item.contentUrl, "קישור לתוכן"),
    recommendationDate: dateValue(item.recommendationDate),
    template: enumValue(item.template, TEMPLATES, "טמפלייט"),
    isActive: item.isActive === true,
    sortOrder,
    createdAt: text(item.createdAt, "תאריך יצירה", 80, true),
    updatedAt: text(item.updatedAt, "תאריך עדכון", 80, true)
  };
}

export function validateRecommendationsInput(input: unknown): RecommendationsInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("הגדרות עמוד הממליצים לא תקינות");
  }
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.items) || value.items.length > 100) {
    throw new Error("ניתן לשמור עד 100 המלצות");
  }

  const ids = new Set<string>();
  const items = value.items.map((item, index) => {
    const validated = validateItem(item, index);
    if (ids.has(validated.id)) throw new Error("נמצא מזהה המלצה כפול");
    ids.add(validated.id);
    return validated;
  });

  return {
    enabled: value.enabled === true,
    title: text(value.title, "כותרת העמוד", 160, true),
    introduction: text(value.introduction, "פתיח", 800),
    items
  };
}

export function normalizeRecommendationsConfig(input: unknown): RecommendationsConfig {
  const raw = input && typeof input === "object" ? (input as Partial<RecommendationsConfig>) : {};
  const merged = {
    ...DEFAULT_RECOMMENDATIONS_CONFIG,
    ...raw,
    items: Array.isArray(raw.items) ? raw.items : []
  };
  const validated = validateRecommendationsInput(merged);
  return {
    ...validated,
    items: validated.items.sort((a, b) => a.sortOrder - b.sortOrder),
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.trim()
        ? raw.updatedAt
        : DEFAULT_RECOMMENDATIONS_CONFIG.updatedAt
  };
}
