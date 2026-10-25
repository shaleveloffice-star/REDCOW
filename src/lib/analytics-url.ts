// Allow attribution parameters only, never arbitrary query data or fragments.
export const ANALYTICS_QUERY_KEYS = [
  "gclid", "dclid", "gbraid", "wbraid",
  "utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content"
] as const;

export function analyticsPageLocation(href: string): string {
  const url = new URL(href);
  const clean = new URL(url.pathname, url.origin);
  for (const key of ANALYTICS_QUERY_KEYS) {
    const value = url.searchParams.get(key);
    if (value) clean.searchParams.set(key, value);
  }
  return clean.href;
}
