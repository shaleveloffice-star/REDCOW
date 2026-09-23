/** The sole public SEO origin, independent of preview hosts or stale environment values. */
export const CANONICAL_SITE_ORIGIN = "https://www.sowhat.co.il";
export const LEGACY_SITE_HOSTS = ["nbburger.co.il", "www.nbburger.co.il"] as const;
export const REDIRECT_SITE_HOSTS = [...LEGACY_SITE_HOSTS, "sowhat.co.il"] as const;

/** Replace only an owned origin. Keep path, query, fragment and external providers intact. */
export function migrateOwnedSiteUrl(value: string): string {
  if (!/^(?:https?:)?\/\//i.test(value)) return value;
  try {
    const url = new URL(value.startsWith("//") ? `https:${value}` : value);
    const ownedHosts: readonly string[] = [...REDIRECT_SITE_HOSTS, "www.sowhat.co.il"];
    if (!ownedHosts.includes(url.hostname) || url.username || url.password) return value;
    return `${CANONICAL_SITE_ORIGIN}${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}
