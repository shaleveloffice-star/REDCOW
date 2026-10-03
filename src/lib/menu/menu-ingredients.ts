import { normalizeMenuImageZoom } from "@/lib/menu/image-zoom";
import type { MenuItem } from "@/types/content";
import type { MenuIngredient } from "@/types/menu-ingredients";

export const MAX_MENU_INGREDIENTS = 200;

function text(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

function optionalText(value: unknown, max: number): string | undefined {
  return text(value, max) || undefined;
}

/** Coerces stored or admin-submitted rows into safe ingredients; drops rows without an id or name. */
export function normalizeMenuIngredients(raw: unknown): MenuIngredient[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const rows: MenuIngredient[] = [];
  for (const entry of raw.slice(0, MAX_MENU_INGREDIENTS)) {
    if (!entry || typeof entry !== "object") continue;
    const value = entry as Record<string, unknown>;
    const id = text(value.id, 200);
    const name = text(value.name, 120);
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    const sortOrder = Number(value.sortOrder);
    rows.push({
      id,
      name,
      ...(optionalText(value.nameEn, 120) ? { nameEn: optionalText(value.nameEn, 120) } : {}),
      ...(optionalText(value.nameFr, 120) ? { nameFr: optionalText(value.nameFr, 120) } : {}),
      ...(optionalText(value.description, 500) ? { description: optionalText(value.description, 500) } : {}),
      ...(optionalText(value.descriptionEn, 500) ? { descriptionEn: optionalText(value.descriptionEn, 500) } : {}),
      ...(optionalText(value.descriptionFr, 500) ? { descriptionFr: optionalText(value.descriptionFr, 500) } : {}),
      imageUrl: text(value.imageUrl, 2000),
      ...(value.imageZoom !== undefined ? { imageZoom: normalizeMenuImageZoom(Number(value.imageZoom)) } : {}),
      isActive: value.isActive !== false,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : rows.length
    });
  }
  return rows;
}

export function sortMenuIngredients(ingredients: MenuIngredient[]): MenuIngredient[] {
  return [...ingredients].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "he"));
}

/** Active ingredients attached to the dish, in the dish's saved order. */
export function resolveItemIngredients(item: Pick<MenuItem, "ingredientIds">, ingredients: MenuIngredient[]): MenuIngredient[] {
  const available = new Map(ingredients.filter(row => row.isActive).map(row => [row.id, row]));
  return [...new Set(item.ingredientIds ?? [])].flatMap(id => available.has(id) ? [available.get(id)!] : []);
}

export function getLocalizedIngredient(ingredient: MenuIngredient, locale: string): { name: string; description: string } {
  if (locale === "en") {
    return { name: ingredient.nameEn || ingredient.name, description: ingredient.descriptionEn || ingredient.description || "" };
  }
  if (locale === "fr") {
    return { name: ingredient.nameFr || ingredient.name, description: ingredient.descriptionFr || ingredient.description || "" };
  }
  return { name: ingredient.name, description: ingredient.description || "" };
}
