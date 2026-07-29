import type { MenuItem } from "@/types/content";

const ASCII_SLUG_PATTERN = /^[\x00-\x7F]+$/;

/** Build a URL-safe ASCII slug from a product name. */
export function slugifyProductName(name: string): string {
  const safeName = String(name ?? "");
  const base = safeName
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`ʼ\u05F3]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const hasNonAscii = /[^\x00-\x7F]/.test(safeName.trim());
  if (!base || (hasNonAscii && base.length < 4)) {
    return "";
  }

  return base;
}

/** Previous slug format (Hebrew allowed) — lookup only for old bookmarks. */
export function legacySlugifyProductName(name: string): string {
  const safeName = String(name ?? "");
  const base = safeName
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`ʼ\u05F3]/g, "")
    .replace(/[^a-z0-9\u0590-\u05ff]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base;
}

function normalizeAsciiSlug(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed || !ASCII_SLUG_PATTERN.test(trimmed)) {
    return "";
  }
  return trimmed;
}

function slugFromItemId(id: string): string {
  return id.replace(/^item-/, "") || id;
}

/** Resolve the public slug for a menu item (explicit slug → name → id). */
export function resolveMenuItemSlug(
  item: Pick<MenuItem, "id" | "name" | "slug">
): string {
  const explicit = normalizeAsciiSlug(item.slug);
  if (explicit) {
    return explicit;
  }

  const fromName = slugifyProductName(item.name);
  if (fromName) {
    return fromName;
  }

  return slugFromItemId(item.id);
}

/** All slug variants that should resolve to this menu item. */
export function getMenuItemSlugAliases(
  item: Pick<MenuItem, "id" | "name" | "slug">
): string[] {
  const aliases = new Set<string>();
  const add = (value: string | undefined) => {
    const normalized = value?.trim().toLowerCase();
    if (normalized) {
      aliases.add(normalized);
    }
  };

  add(resolveMenuItemSlug(item));
  add(normalizeAsciiSlug(item.slug));
  add(legacySlugifyProductName(item.name));
  add(item.id);
  add(slugFromItemId(item.id));

  return [...aliases];
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

  const base =
    (normalizeAsciiSlug(desired) || "item").toLowerCase().replace(/^-+|-+$/g, "") || "item";
  if (!taken.has(base)) {
    return base;
  }

  let n = 2;
  while (taken.has(`${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}
