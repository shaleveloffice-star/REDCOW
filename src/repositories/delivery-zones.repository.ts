import { defaultDeliveryZonesConfig } from "@/data/delivery-zones-defaults";
import { createFirestoreDocumentStore } from "@/lib/firebase/firestore-store";
import { localDeliveryZonesStore } from "@/lib/firebase/local-stores";
import type { DeliveryZone, DeliveryZonesConfig } from "@/types/content";

// siteSettings docs are already publicly readable — no new Firestore rules needed.
const store = createFirestoreDocumentStore<DeliveryZonesConfig>(
  "siteSettings",
  "delivery-zones",
  localDeliveryZonesStore
);

function normalizeZone(value: unknown): DeliveryZone | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const name = String(raw.name ?? "").trim().slice(0, 80);
  if (!name) return null;
  const areasNote = String(raw.areasNote ?? "").trim().slice(0, 120);
  return areasNote ? { name, areasNote } : { name };
}

export function normalizeDeliveryZonesConfig(
  input: Partial<DeliveryZonesConfig> | null | undefined
): DeliveryZonesConfig {
  const defaults = defaultDeliveryZonesConfig();
  const raw = input ?? {};
  // Missing/invalid zones stay empty so the public page keeps the i18n fallback.
  const zones = Array.isArray(raw.zones)
    ? raw.zones.map(normalizeZone).filter((zone): zone is DeliveryZone => Boolean(zone)).slice(0, 40)
    : [];

  return {
    zones,
    note: String(raw.note ?? "").trim().slice(0, 400),
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.trim()
        ? raw.updatedAt
        : defaults.updatedAt
  };
}

export async function getDeliveryZonesConfig(): Promise<DeliveryZonesConfig> {
  try {
    return normalizeDeliveryZonesConfig(await store.get());
  } catch (error) {
    console.error("[delivery-zones] read failed", error);
    return defaultDeliveryZonesConfig();
  }
}

export async function saveDeliveryZonesConfig(
  input: Partial<DeliveryZonesConfig>
): Promise<DeliveryZonesConfig> {
  const payload = normalizeDeliveryZonesConfig({
    ...input,
    updatedAt: new Date().toISOString()
  });
  return store.save(payload);
}
