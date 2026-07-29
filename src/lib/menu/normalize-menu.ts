import type { MenuCategory, MenuItem } from "@/types/content";

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

function toOptionalText(value: unknown): string | undefined {
  const text = toText(value);
  return text.length > 0 ? text : undefined;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry) => toText(entry)).filter(Boolean);
}

function toBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "false" || value === "0" || value === 0) {
    return false;
  }
  if (value === "true" || value === "1" || value === 1) {
    return true;
  }
  if (value == null) {
    return fallback;
  }
  return Boolean(value);
}

function toIsoDate(value: unknown, fallback: string): string {
  const text = toText(value);
  return text || fallback;
}

/** Coerce Firestore / partial admin payloads into a safe MenuItem shape. */
export function normalizeMenuItem(raw: Partial<MenuItem> & { id: string }): MenuItem {
  const now = new Date().toISOString();
  const id = toText(raw.id);
  const name = toText(raw.name) || "NB BURGER";

  return {
    id: id || name,
    name,
    description: toText(raw.description),
    ...(toOptionalText(raw.longDescription)
      ? { longDescription: toOptionalText(raw.longDescription) }
      : {}),
    price: toNumber(raw.price, 0),
    categoryId: toText(raw.categoryId),
    imageUrl: toText(raw.imageUrl),
    closeUpImageUrl: toText(raw.closeUpImageUrl),
    ...(toOptionalText(raw.slug) ? { slug: toOptionalText(raw.slug) } : {}),
    ...(toOptionalText(raw.imageAlt) ? { imageAlt: toOptionalText(raw.imageAlt) } : {}),
    ...(toOptionalText(raw.primaryKeyword)
      ? { primaryKeyword: toOptionalText(raw.primaryKeyword) }
      : {}),
    ...(toOptionalText(raw.metaTitle) ? { metaTitle: toOptionalText(raw.metaTitle) } : {}),
    ...(toOptionalText(raw.metaDescription)
      ? { metaDescription: toOptionalText(raw.metaDescription) }
      : {}),
    ...(toStringArray(raw.galleryUrls).length > 0
      ? { galleryUrls: toStringArray(raw.galleryUrls) }
      : {}),
    ...(toStringArray(raw.detailNotes).length > 0
      ? { detailNotes: toStringArray(raw.detailNotes) }
      : {}),
    isActive: toBoolean(raw.isActive, true),
    tags: toStringArray(raw.tags),
    sortOrder: toNumber(raw.sortOrder, 0),
    createdAt: toIsoDate(raw.createdAt, now),
    updatedAt: toIsoDate(raw.updatedAt, now)
  };
}

/** Coerce Firestore / partial admin payloads into a safe MenuCategory shape. */
export function normalizeMenuCategory(raw: Partial<MenuCategory> & { id: string }): MenuCategory {
  const now = new Date().toISOString();
  const id = toText(raw.id);
  const name = toText(raw.name) || "קטגוריה";

  return {
    id: id || name,
    name,
    slug: toText(raw.slug) || id || "category",
    ...(toOptionalText(raw.description) ? { description: toOptionalText(raw.description) } : {}),
    sortOrder: toNumber(raw.sortOrder, 0),
    isActive: toBoolean(raw.isActive, true),
    createdAt: toIsoDate(raw.createdAt, now),
    updatedAt: toIsoDate(raw.updatedAt, now)
  };
}

/** Safe media URL for UI — never throws on missing values. */
export function resolveMenuItemMediaUrl(
  imageUrl: unknown,
  fallback = "/images/menu/nb-menu-burger.png"
): string {
  return toText(imageUrl) || fallback;
}
