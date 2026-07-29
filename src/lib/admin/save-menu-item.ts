import "server-only";

import { materializeMenuImageUrl } from "@/lib/admin/save-menu-image";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import {
  ensureUniqueProductSlug,
  resolveMenuItemSlug,
  slugifyProductName
} from "@/lib/menu/product-slug";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import { revalidatePath, updateTag } from "next/cache";
import { listMenuItems, upsertMenuItem } from "@/services/menu.service";
import type { MenuItem } from "@/types/content";

const menuPaths = ["/admin/menu", "/admin/menu-categories", "/", "/menu"];

export type SaveMenuItemResult =
  | { ok: true; item: MenuItem }
  | { ok: false; error: string };

function formatSaveError(err: unknown): string {
  const detail = err instanceof Error ? err.message : String(err ?? "unknown");
  const trimmed = detail.replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed === "unknown") {
    return "שמירת המנה נכשלה. נסו שוב.";
  }
  const short = trimmed.length > 400 ? `${trimmed.slice(0, 400)}…` : trimmed;
  if (
    short.startsWith("שמירת") ||
    short.startsWith("אין") ||
    short.startsWith("שם") ||
    short.startsWith("מחיר") ||
    short.startsWith("תמונ") ||
    short.startsWith("לא") ||
    short.startsWith("סלאג") ||
    short.startsWith("תיאור") ||
    short.startsWith("מילת") ||
    short.startsWith("כותרת") ||
    short.startsWith("Firebase") ||
    short.startsWith("Firestore")
  ) {
    return short;
  }
  return `שמירת המנה נכשלה: ${short}`;
}

function revalidateMenuCacheBestEffort(slug?: string) {
  try {
    for (const path of menuPaths) {
      revalidatePath(path);
    }
    if (slug) {
      revalidatePath(`/menu/${slug}`);
    }
    updateTag(CACHE_TAGS.homepageMenu);
    updateTag(CACHE_TAGS.menuCategories);
    updateTag(CACHE_TAGS.menuDisplay);
  } catch (err) {
    console.warn(
      "[saveMenuItem] revalidate skipped:",
      err instanceof Error ? err.message : err
    );
  }
}

function optionalTrim(value: unknown): string | undefined {
  const trimmed = String(value ?? "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Shared save path for Server Action + /api/admin/menu-item */
export async function saveMenuItemCore(input: MenuItem): Promise<SaveMenuItemResult> {
  try {
    const name = String(input.name ?? "").trim();
    if (!name) return { ok: false, error: "שם המנה נדרש" };

    const price = Number(input.price);
    if (!Number.isFinite(price) || price < 0) return { ok: false, error: "מחיר לא תקין" };

    const isActive = Boolean(input.isActive);
    if (isActive && price <= 0) {
      return {
        ok: false,
        error:
          "לא ניתן לפרסם מנה פעילה במחיר 0. יש להגדיר מחיר גדול מ-0 או לבטל את הסימון פעיל."
      };
    }

    const id = String(input.id ?? "").trim();
    if (!id) return { ok: false, error: "מזהה מנה חסר" };

    const categoryId = String(input.categoryId ?? "").trim();
    if (!categoryId) return { ok: false, error: "יש לבחור קטגוריה" };

    const description = String(input.description ?? "").trim();
    const longDescription = optionalTrim(input.longDescription);
    const primaryKeyword = optionalTrim(input.primaryKeyword);
    const metaTitle = optionalTrim(input.metaTitle);
    const metaDescription = optionalTrim(input.metaDescription);

    if (metaTitle && metaTitle.length > 60) {
      return { ok: false, error: "כותרת SEO מומלצת עד 60 תווים" };
    }
    if (metaDescription && metaDescription.length > 160) {
      return { ok: false, error: "תיאור SEO מומלץ עד 160 תווים" };
    }

    const imageUrlRaw = String(input.imageUrl ?? "").trim();
    let imageUrl = "";
    if (imageUrlRaw) {
      try {
        imageUrl = assertSafeHttpUrl(imageUrlRaw, "תמונת מנה");
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "תמונת מנה לא תקינה"
        };
      }

      const materialized = await materializeMenuImageUrl(imageUrl);
      if (!materialized.ok) {
        return { ok: false, error: materialized.error };
      }
      imageUrl = materialized.url;

      if (imageUrl.startsWith("data:image/")) {
        return {
          ok: false,
          error: "התמונה לא הועלתה לשרת (קישור זמני). העלו שוב את התמונה ואז שמרו."
        };
      }
    }

    let closeUpImageUrl = optionalTrim(input.closeUpImageUrl);
    if (closeUpImageUrl) {
      try {
        closeUpImageUrl = assertSafeHttpUrl(closeUpImageUrl, "תמונה מקרוב מוצר");
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "תמונה מקרוב מוצר לא תקינה"
        };
      }

      const closeUpMaterialized = await materializeMenuImageUrl(closeUpImageUrl);
      if (!closeUpMaterialized.ok) {
        return { ok: false, error: closeUpMaterialized.error };
      }
      closeUpImageUrl = closeUpMaterialized.url;

      if (closeUpImageUrl.startsWith("data:image/")) {
        return {
          ok: false,
          error: "תמונת המקרוב לא הועלתה לשרת. העלו שוב את הקובץ ואז שמרו."
        };
      }
    }

    const imageAlt =
      optionalTrim(input.imageAlt) ||
      (imageUrl ? name : undefined);
    if (imageUrl && !imageAlt) {
      return { ok: false, error: "יש למלא טקסט ALT לתמונת המנה" };
    }

    const allItems = await listMenuItems({ activeOnly: false });
    const desiredSlug =
      optionalTrim(input.slug) ||
      slugifyProductName(name) ||
      resolveMenuItemSlug({ id, name, slug: undefined });
    const slug = ensureUniqueProductSlug(desiredSlug, [], {
      currentId: id,
      items: allItems
    });

    const now = new Date().toISOString();
    const galleryUrls = Array.isArray(input.galleryUrls)
      ? input.galleryUrls.map(String).map((url) => url.trim()).filter(Boolean)
      : undefined;
    const detailNotes = Array.isArray(input.detailNotes)
      ? input.detailNotes.map(String).map((note) => note.trim()).filter(Boolean)
      : undefined;

    const saved = await upsertMenuItem({
      id,
      name,
      description,
      ...(longDescription ? { longDescription } : {}),
      price,
      categoryId,
      imageUrl,
      slug,
      ...(imageAlt ? { imageAlt } : {}),
      ...(primaryKeyword ? { primaryKeyword } : {}),
      ...(metaTitle ? { metaTitle } : {}),
      ...(metaDescription ? { metaDescription } : {}),
      closeUpImageUrl: closeUpImageUrl ?? "",
      ...(galleryUrls && galleryUrls.length > 0 ? { galleryUrls } : {}),
      ...(detailNotes && detailNotes.length > 0 ? { detailNotes } : {}),
      isActive,
      tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
      sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0,
      createdAt: String(input.createdAt ?? now),
      updatedAt: now
    });

    revalidateMenuCacheBestEffort(slug);
    return { ok: true, item: saved };
  } catch (err) {
    console.warn("[saveMenuItemCore]", err instanceof Error ? err.message : err);
    return { ok: false, error: formatSaveError(err) };
  }
}
