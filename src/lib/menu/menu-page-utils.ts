import type { OrderLink } from "@/types/content";

export function resolveMenuOrderUrls(orderLinks: OrderLink[]) {
  const pickup =
    orderLinks.find((link) => link.type === "pickup" && link.isActive)?.url ?? "/menu";
  const delivery =
    orderLinks.find(
      (link) => (link.type === "delivery" || link.type === "marketplace") && link.isActive
    )?.url ?? "/locations";

  return { pickupUrl: pickup, deliveryUrl: delivery };
}

export function normalizeMenuSlugParam(slug: string): string {
  let value = slug.trim();

  try {
    while (/%[0-9A-Fa-f]{2}/.test(value)) {
      const decoded = decodeURIComponent(value);
      if (decoded === value) break;
      value = decoded;
    }
  } catch {
    // Keep the raw slug when decoding fails.
  }

  return value.toLowerCase();
}
