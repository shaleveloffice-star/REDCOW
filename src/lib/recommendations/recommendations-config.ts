import { isVideoMediaUrl } from "@/lib/menu-media";
import { getRecommendationContentKind } from "@/lib/recommendations/content-kind";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import type {
  CreatorRecommendation,
  RecommendationContentKind,
  RecommendationMediaType,
  RecommendationPlatform,
  RecommendationTemplate,
  RecommendationsConfig,
  RecommendationsInput
} from "@/types/recommendations";

export const DEFAULT_RECOMMENDATIONS_CONFIG: RecommendationsConfig = {
  enabled: false,
  title: "באו לטעום",
  introduction: "יוצרי תוכן שביקרו ב־SO WHAT, טעמו ושיתפו את החוויה שלהם.",
  items: [],
  updatedAt: new Date(0).toISOString()
};

const PLATFORMS: RecommendationPlatform[] = ["instagram", "tiktok", "youtube", "other"];
const MEDIA_TYPES: RecommendationMediaType[] = ["image", "video"];
const TEMPLATES: RecommendationTemplate[] = ["portrait", "quote", "media"];
const CONTENT_KINDS: RecommendationContentKind[] = ["creator", "press"];

function text(value: unknown, label: string, maxLength: number, required = false): string {
  if (typeof value !== "string") throw new Error(`${label}: ערך לא תקין`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new Error(`${label}: שדה חובה`);
  if (trimmed.length > maxLength) throw new Error(`${label}: עד ${maxLength} תווים`);
  return trimmed;
}

function softText(value: unknown, maxLength: number, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return trimmed.slice(0, maxLength);
  return trimmed;
}

function url(value: unknown, label: string, required = false): string {
  const raw = text(value, label, 4096, required);
  if (!raw) return "";
  const safe = assertSafeHttpUrl(raw, label);
  if (safe.startsWith("data:")) throw new Error(`${label}: יש להעלות תמונה דרך כפתור ההעלאה`);
  return safe;
}

function softUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const raw = value.trim();
  if (!raw || raw.length > 4096) return "";
  try {
    const safe = assertSafeHttpUrl(raw, "url");
    return safe.startsWith("data:") ? "" : safe;
  } catch {
    return "";
  }
}

function dateValue(value: unknown, strict: boolean): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    if (strict) throw new Error("תאריך ההמלצה לא תקין");
    return "";
  }
  const date = value.trim();
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    if (strict) throw new Error("תאריך ההמלצה לא תקין");
    return "";
  }
  return date;
}

function resolveContentKind(value: unknown): RecommendationContentKind {
  return typeof value === "string" && CONTENT_KINDS.includes(value as RecommendationContentKind)
    ? (value as RecommendationContentKind)
    : "creator";
}

function resolveMedia(
  item: Record<string, unknown>,
  strict: boolean,
  contentKind: RecommendationContentKind
): { mediaUrl: string; mediaType: RecommendationMediaType } {
  const mediaUrl = strict ? url(item.mediaUrl, contentKind === "press" ? "תמונת שער" : "מדיה") : softUrl(item.mediaUrl);
  if (contentKind === "press") {
    if (strict && mediaUrl && isVideoMediaUrl(mediaUrl)) {
      throw new Error("לכתבה יש להעלות תמונת שער, לא קובץ וידאו");
    }
    return { mediaUrl, mediaType: "image" };
  }

  const inferredType: RecommendationMediaType = mediaUrl
    ? isVideoMediaUrl(mediaUrl)
      ? "video"
      : "image"
    : "image";
  const rawType =
    typeof item.mediaType === "string" && MEDIA_TYPES.includes(item.mediaType as RecommendationMediaType)
      ? (item.mediaType as RecommendationMediaType)
      : inferredType;
  const mediaType = mediaUrl ? inferredType : rawType;
  if (strict && mediaUrl && mediaType === "video" && !isVideoMediaUrl(mediaUrl)) {
    throw new Error("לווידאו יש להזין קישור ישיר לקובץ MP4, WebM או MOV");
  }
  return { mediaUrl, mediaType };
}

function coerceItem(value: unknown, index: number, strict: boolean): CreatorRecommendation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`המלצה ${index + 1}: נתונים לא תקינים`);
  }
  const item = value as Record<string, unknown>;
  const contentKind = resolveContentKind(item.contentKind);
  const { mediaUrl, mediaType } = resolveMedia(item, strict, contentKind);

  const sortOrderRaw = Number(item.sortOrder);
  const sortOrder =
    Number.isInteger(sortOrderRaw) && sortOrderRaw >= 0 && sortOrderRaw <= 10_000
      ? sortOrderRaw
      : index + 1;
  if (strict && (!Number.isInteger(sortOrderRaw) || sortOrderRaw < 0 || sortOrderRaw > 10_000)) {
    throw new Error("סדר תצוגה לא תקין");
  }

  const platform =
    typeof item.platform === "string" && PLATFORMS.includes(item.platform as RecommendationPlatform)
      ? (item.platform as RecommendationPlatform)
      : "instagram";
  const template =
    typeof item.template === "string" && TEMPLATES.includes(item.template as RecommendationTemplate)
      ? (item.template as RecommendationTemplate)
      : contentKind === "press"
        ? "portrait"
        : mediaUrl
          ? mediaType === "video"
            ? "media"
            : "portrait"
          : "quote";

  const now = new Date().toISOString();
  const id = strict
    ? text(item.id, "מזהה", 160, true)
    : softText(item.id, 160) || `recommendation-${index + 1}`;

  if (contentKind === "press") {
    const outletName = strict
      ? text(item.creatorName, "שם האתר / גוף התקשורת", 120, true)
      : softText(item.creatorName, 120) || `כתבה ${index + 1}`;
    const articleTitle = strict
      ? text(item.articleTitle, "כותרת הכתבה", 200, true)
      : softText(item.articleTitle, 200) || softText(item.quote, 200) || outletName;
    const contentUrl = strict
      ? url(item.contentUrl, "קישור לכתבה", true)
      : softUrl(item.contentUrl);
    const quote = strict
      ? text(item.quote, "תיאור קצר", 1200)
      : softText(item.quote, 1200);

    return {
      id,
      contentKind: "press",
      creatorName: outletName,
      handle: "",
      quote,
      articleTitle,
      mediaType: "image",
      mediaUrl,
      posterUrl: "",
      mediaAlt: strict
        ? text(item.mediaAlt, "תיאור תמונת שער לנגישות", 300) || articleTitle
        : softText(item.mediaAlt, 300) || articleTitle,
      platform: "other",
      profileUrl: "",
      contentUrl,
      recommendationDate: dateValue(item.recommendationDate, strict),
      template: "portrait",
      isActive: item.isActive !== false,
      sortOrder,
      createdAt: strict
        ? text(item.createdAt, "תאריך יצירה", 80, true)
        : softText(item.createdAt, 80) || now,
      updatedAt: strict
        ? text(item.updatedAt, "תאריך עדכון", 80, true)
        : softText(item.updatedAt, 80) || now
    };
  }

  const creatorName = strict
    ? text(item.creatorName, "שם היוצר", 120, true)
    : softText(item.creatorName, 120) || `יוצר ${index + 1}`;

  return {
    id,
    contentKind: "creator",
    creatorName,
    handle: strict ? text(item.handle, "שם משתמש", 120) : softText(item.handle, 120),
    quote: strict
      ? text(item.quote, "ציטוט / המלצה", 1200) || creatorName
      : softText(item.quote, 1200),
    articleTitle: softText(item.articleTitle, 200),
    mediaType,
    mediaUrl,
    posterUrl: strict ? url(item.posterUrl, "תמונת המתנה") : softUrl(item.posterUrl),
    mediaAlt: strict
      ? text(item.mediaAlt, "תיאור מדיה לנגישות", 300) || creatorName
      : softText(item.mediaAlt, 300) || creatorName,
    platform,
    profileUrl: strict
      ? url(item.profileUrl, "קישור לפרופיל", true)
      : softUrl(item.profileUrl),
    contentUrl: strict ? url(item.contentUrl, "קישור לתוכן") : softUrl(item.contentUrl),
    recommendationDate: dateValue(item.recommendationDate, strict),
    template,
    isActive: item.isActive !== false,
    sortOrder,
    createdAt: strict
      ? text(item.createdAt, "תאריך יצירה", 80, true)
      : softText(item.createdAt, 80) || now,
    updatedAt: strict
      ? text(item.updatedAt, "תאריך עדכון", 80, true)
      : softText(item.updatedAt, 80) || now
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
    const validated = coerceItem(item, index, true);
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

/** Lenient read path — never crash admin/public on older incomplete cards. */
export function normalizeRecommendationsConfig(input: unknown): RecommendationsConfig {
  const raw = input && typeof input === "object" ? (input as Partial<RecommendationsConfig>) : {};
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const ids = new Set<string>();
  const items: CreatorRecommendation[] = [];

  for (let index = 0; index < rawItems.length; index += 1) {
    try {
      const item = coerceItem(rawItems[index], index, false);
      if (ids.has(item.id)) continue;
      ids.add(item.id);
      items.push(item);
    } catch {
      // Skip unreadable rows so admin stays reachable.
    }
  }

  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title.trim().slice(0, 160)
      : DEFAULT_RECOMMENDATIONS_CONFIG.title;
  const introduction =
    typeof raw.introduction === "string" ? raw.introduction.trim().slice(0, 800) : "";

  return {
    enabled: raw.enabled === true,
    title,
    introduction,
    items: items.sort((a, b) => a.sortOrder - b.sortOrder),
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.trim()
        ? raw.updatedAt
        : DEFAULT_RECOMMENDATIONS_CONFIG.updatedAt
  };
}

export { getRecommendationContentKind };
