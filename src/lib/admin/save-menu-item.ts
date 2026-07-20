import "server-only";

import { materializeMenuImageUrl } from "@/lib/admin/save-menu-image";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import { revalidatePath, updateTag } from "next/cache";
import { upsertMenuItem } from "@/services/menu.service";
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
  // Always expose the real cause (truncate for UI).
  const short = trimmed.length > 400 ? `${trimmed.slice(0, 400)}…` : trimmed;
  if (short.startsWith("שמירת") || short.startsWith("אין") || short.startsWith("שם") || short.startsWith("מחיר") || short.startsWith("תמונ") || short.startsWith("לא") || short.startsWith("Firebase") || short.startsWith("Firestore")) {
    return short;
  }
  return `שמירת המנה נכשלה: ${short}`;
}

function revalidateMenuCacheBestEffort() {
  try {
    for (const path of menuPaths) {
      revalidatePath(path);
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

    const imageUrlRaw = String(input.imageUrl ?? "").trim() || "/images/menu/nb-menu-burger.png";
    let imageUrl: string;
    try {
      imageUrl = assertSafeHttpUrl(imageUrlRaw, "תמונת מנה");
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "תמונת מנה לא תקינה"
      };
    }

    // Never persist huge data URLs in Firestore — upload to Storage / disk first.
    const materialized = await materializeMenuImageUrl(imageUrl);
    if (!materialized.ok) {
      return { ok: false, error: materialized.error };
    }
    imageUrl = materialized.url;

    if (imageUrl.startsWith("data:image/")) {
      return {
        ok: false,
        error:
          "התמונה לא הועלתה לשרת (קישור זמני). העלו שוב את התמונה ואז שמרו."
      };
    }

    const now = new Date().toISOString();
    const saved = await upsertMenuItem({
      id,
      name,
      description: String(input.description ?? "").trim(),
      price,
      categoryId,
      imageUrl,
      isActive,
      tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
      sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0,
      createdAt: String(input.createdAt ?? now),
      updatedAt: now
    });

    revalidateMenuCacheBestEffort();
    return { ok: true, item: saved };
  } catch (err) {
    console.warn("[saveMenuItemCore]", err instanceof Error ? err.message : err);
    return { ok: false, error: formatSaveError(err) };
  }
}
