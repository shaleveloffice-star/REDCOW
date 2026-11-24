import type { DeliveryZone, DeliveryZonesConfig } from "@/types/content";

/**
 * Empty until an admin save — public /locations keeps using i18n messages unchanged.
 */
export function defaultDeliveryZonesConfig(): DeliveryZonesConfig {
  return {
    zones: [],
    note: "",
    updatedAt: new Date(0).toISOString()
  };
}

/** Prefill for the admin form only — mirrors the current Hebrew public list. */
export const ADMIN_DELIVERY_ZONES_SEED: DeliveryZone[] = [
  { name: "רעננה" },
  { name: "כפר סבא" },
  { name: "הרצליה", areasNote: "אזורים נבחרים" },
  { name: "הוד השרון", areasNote: "אזורים נבחרים" },
  { name: "רמות השבים" },
  { name: "גבעת חן" },
  { name: "בצרה", areasNote: "אזורים נבחרים" },
  { name: "חרוצים" }
];

export const ADMIN_DELIVERY_ZONES_NOTE_SEED =
  'המשלוחים מתבצעים עד כ־5 ק"מ מהסניף, בהתאם לכתובת ההזמנה וזמינות אזור המשלוחים.';
