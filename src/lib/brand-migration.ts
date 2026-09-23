import { migrateOwnedSiteUrl } from "@/data/site-domain";
import { getMenuItemSlugAliases, resolveMenuItemSlug } from "@/lib/menu/product-slug";
import { normalizeStorySlug, resolveStorySlug } from "@/lib/stories/story-slug";

/** Text-only migration; URLs, filenames, email addresses and account handles are protected. */
export function rebrandText(value: string): string {
  const protectedTokens = /(https?:\/\/[^\s<>"']+|\/\/[^\s<>"']+|\/[a-zA-Z0-9_][^\s<>"']*|(?:mailto:)?[\w.%+-]+@[\w.-]+\.[a-z]{2,}|@[\w.]+)/gi;
  return value.split(protectedTokens).map((part, index) => {
    if (index % 2) return migrateOwnedSiteUrl(part);
    return part.replace(/\bNB[\s_-]*BURGER\b/gi, "SO WHAT")
      .replace(/\bNB\b/g, "SO WHAT");
  }).join("");
}

const TEXT_FIELDS = new Set([
  "name", "siteName", "title", "subtitle", "description", "longDescription", "body", "text",
  "metaTitle", "metaDescription", "seoTitle", "seoDescription", "ogTitle", "ogDescription",
  "alt", "imageAlt", "heroImageAlt", "heroMediaAlt", "caption", "label", "buttonLabel",
  "kicker", "lead", "question", "answer", "introduction", "bottomContent", "sectionTitle",
  "detailNotes", "primaryKeyword", "tags", "introductionParagraphs", "bottomParagraphs", "categoryIntros",
  "displayName", "displayDescription", "displayLongDescription", "displayDetailNotes", "displayImageAlt"
]);
const URL_FIELDS = new Set(["url", "href", "@id", "item", "image", "logo", "sameAs", "hasMenu"]);

/** Non-destructive projection of CMS display fields. Never rewrites IDs, slugs or private records. */
export function rebrandContent<T>(value: T, field = ""): T {
  if (typeof value === "string") {
    if (URL_FIELDS.has(field) || /(?:Url|Urls|Href)$/.test(field)) return migrateOwnedSiteUrl(value) as T;
    return (TEXT_FIELDS.has(field) ? rebrandText(value) : value) as T;
  }
  if (Array.isArray(value)) return value.map(entry => rebrandContent(entry, field)) as T;
  if (value && typeof value === "object" && Object.prototype.toString.call(value) === "[object Object]") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
      key, rebrandContent(entry, field === "categoryIntros" ? field : key)
    ])) as T;
  }
  return value;
}

/** Freeze name-derived public routes before changing a legacy record's display text. */
export function rebrandCmsRecord<T>(value: T, collectionName: string): T {
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  let stable = record;
  if (collectionName === "menuItems" && typeof record.id === "string" && typeof record.name === "string") {
    const item = { id: record.id, name: record.name, slug: typeof record.slug === "string" ? record.slug : undefined,
      previousSlugs: Array.isArray(record.previousSlugs) ? record.previousSlugs as string[] : [] };
    if (rebrandText(item.name) !== item.name) {
      stable = { ...record, slug: resolveMenuItemSlug(item), previousSlugs: getMenuItemSlugAliases(item) };
    }
  }
  if (collectionName === "brandStories" && typeof record.id === "string" && typeof record.title === "string") {
    const story = { id: record.id, title: record.title, slug: typeof record.slug === "string" ? record.slug : undefined };
    if (rebrandText(story.title) !== story.title) {
      stable = { ...record, slug: resolveStorySlug(story), previousSlugs: [...new Set([
        ...(Array.isArray(record.previousSlugs) ? record.previousSlugs : []), normalizeStorySlug(story.title),
        normalizeStorySlug(story.slug ?? "")
      ].filter(Boolean))] };
    }
  }
  return rebrandContent(stable) as T;
}
