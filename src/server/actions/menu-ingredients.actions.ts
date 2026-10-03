"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { MAX_MENU_INGREDIENTS, normalizeMenuIngredients } from "@/lib/menu/menu-ingredients";
import { assertSafeHttpUrl } from "@/lib/security/safe-url";
import { getMenuIngredients, saveMenuIngredients } from "@/repositories/menu-ingredients.repository";
import type { MenuIngredient } from "@/types/menu-ingredients";

export async function getMenuIngredientsAdminData(): Promise<MenuIngredient[]> {
  await requireAdmin();
  return getMenuIngredients();
}

export async function saveMenuIngredientsAction(
  input: MenuIngredient[]
): Promise<{ ok: true; items: MenuIngredient[] } | { ok: false; error: string }> {
  await requireAdmin();
  if (!Array.isArray(input) || input.length > MAX_MENU_INGREDIENTS) {
    return { ok: false, error: `אפשר לשמור עד ${MAX_MENU_INGREDIENTS} מרכיבים.` };
  }
  if (input.some(row => !String(row?.name ?? "").trim())) {
    return { ok: false, error: "לכל מרכיב צריך שם." };
  }
  let rows: MenuIngredient[];
  try {
    rows = normalizeMenuIngredients(input).map(row => {
      const imageUrl = assertSafeHttpUrl(row.imageUrl, `תמונת ${row.name}`);
      if (imageUrl.startsWith("data:")) throw new Error(`התמונה של ${row.name} לא הועלתה לשרת. העלו אותה שוב.`);
      return { ...row, imageUrl };
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שמירת המרכיבים נכשלה." };
  }
  const items = await saveMenuIngredients(rows);
  updateTag(CACHE_TAGS.menuIngredients);
  revalidatePath("/admin/menu");
  revalidatePath("/menu", "layout");
  return { ok: true, items };
}
