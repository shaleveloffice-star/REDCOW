import {
  getDeliveryZonesConfig,
  saveDeliveryZonesConfig
} from "@/repositories/delivery-zones.repository";
import type { DeliveryZonesConfig } from "@/types/content";

export async function getDeliveryZones(): Promise<DeliveryZonesConfig> {
  return getDeliveryZonesConfig();
}

export async function updateDeliveryZones(
  input: Partial<DeliveryZonesConfig>
): Promise<DeliveryZonesConfig> {
  return saveDeliveryZonesConfig(input);
}
