import type { MenuItem } from "@/types/content";

/** Build a URL-safe slug from a product name (Latin + Hebrew letters allowed). */
export function slugifyProductName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`ʼ]/g, "")
    .replace(/[^a-z0-9\u0590-\u05ff]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base;
}

/** Resolve the public slug for a menu item (explicit slug → name → id). */
export function resolveMenuItemSlug(
  item: Pick<MenuItem, "id" | "name" | "slug">
): string {
  const explicit = item.slug?.trim();
  if (explicit) {
    return explicit;
  }

  const fromName = slugifyProductName(item.name);
  if (fromName) {
    return fromName;
  }

  return item.id.replace(/^item-/, "") || item.id;
}

export function getMenuItemHref(item: Pick<MenuItem, "id" | "name" | "slug">): string {
  return `/menu/${resolveMenuItemSlug(item)}`;
}

/** Ensure slug is unique among siblings (appends -2, -3, … when needed). */
export function ensureUniqueProductSlug(
  desired: string,
  existingSlugs: Iterable<string>,
  options: { currentId?: string; items?: Pick<MenuItem, "id" | "name" | "slug">[] } = {}
): string {
  const taken = new Set<string>();
  for (const slug of existingSlugs) {
    const value = slug.trim().toLowerCase();
    if (value) taken.add(value);
  }
  if (options.items) {
    for (const item of options.items) {
      if (options.currentId && item.id === options.currentId) continue;
      taken.add(resolveMenuItemSlug(item).toLowerCase());
    }
  }

  const base = (desired.trim() || "item").toLowerCase().replace(/^-+|-+$/g, "") || "item";
  if (!taken.has(base)) {
    return base;
  }

  let n = 2;
  while (taken.has(`${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}
