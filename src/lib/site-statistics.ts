export type SiteMetric = "views" | "seconds" | "orders" | "phones" | "directions";

export function publicStatisticsPath(path: string) {
  return /^\/(?:|menu(?:\/[a-z0-9-]{1,100})?|stories(?:\/[a-z0-9-]{1,100})?|about|locations|contact|kosher|careers|recommendations|privacy-policy|terms|accessibility)$/.test(path);
}

export function sendSiteMetric(path: string, metric: SiteMetric, value = 1) {
  if (!publicStatisticsPath(path) || typeof window.fetch !== "function") return;
  void window.fetch("/api/site-statistics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, metric, value }),
    keepalive: true
  }).catch(() => {});
}
