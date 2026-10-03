export const ORDER_URL = "https://orders.beecommcloud.com/#/sites/p-0/6a7ac77d3d4361a6e57caa87";

/** Replace missing/placeholder destinations while preserving real admin-managed links. */
export function resolveOrderUrl(value?: string | null): string {
  try {
    const url = new URL(value ?? "");
    if (url.protocol === "https:" && url.hostname !== "example.com" && !url.hostname.endsWith(".example.com")) return url.href;
  } catch { /* No approved destination. */ }
  return ORDER_URL;
}
