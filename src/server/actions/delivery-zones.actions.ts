"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { normalizeDeliveryZonesConfig } from "@/repositories/delivery-zones.repository";
import { getDeliveryZones, updateDeliveryZones } from "@/services/delivery-zones.service";
import type { DeliveryZonesConfig } from "@/types/content";
import { revalidatePath, updateTag } from "next/cache";

export type DeliveryZonesSaveResult = {
  ok: true;
  config: DeliveryZonesConfig;
};

function revalidateDeliveryZones() {
  try {
    updateTag(CACHE_TAGS.deliveryZones);
    revalidatePath("/locations");
    revalidatePath("/admin/branches");
  } catch {
    // ignore
  }
}

export async function getDeliveryZonesAdminData() {
  await requireAdmin();
  return getDeliveryZones();
}

export async function saveDeliveryZonesAction(
  input: Partial<DeliveryZonesConfig>
): Promise<DeliveryZonesSaveResult> {
  try {
    await requireAdmin();
  } catch {
    throw new Error("אין הרשאת אדמין. התחברו מחדש ל־/admin/login");
  }

  const next = normalizeDeliveryZonesConfig({
    ...input,
    updatedAt: new Date().toISOString()
  });

  if (next.zones.length === 0) {
    throw new Error("יש להוסיף לפחות אזור משלוח אחד.");
  }
  if (next.zones.some((zone) => !zone.name.trim())) {
    throw new Error("שם אזור המשלוח נדרש.");
  }

  const saved = await updateDeliveryZones(next);
  revalidateDeliveryZones();
  return { ok: true, config: saved };
}
