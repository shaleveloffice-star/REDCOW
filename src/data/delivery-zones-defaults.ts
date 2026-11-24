import type { DeliveryZonesConfig } from "@/types/content";

/** Matches the Hebrew public list so organic content stays identical until edited. */
export function defaultDeliveryZonesConfig(): DeliveryZonesConfig {
  return {
    zones: [
      { name: "רעננה" },
      { name: "כפר סבא" },
      { name: "הרצליה", areasNote: "אזורים נבחרים" },
      { name: "הוד השרון", areasNote: "אזורים נבחרים" },
      { name: "רמות השבים" },
      { name: "גבעת חן" },
      { name: "בצרה", areasNote: "אזורים נבחרים" },
      { name: "חרוצים" }
    ],
    note: 'המשלוחים מתבצעים עד כ־5 ק"מ מהסניף, בהתאם לכתובת ההזמנה וזמינות אזור המשלוחים.',
    updatedAt: new Date(0).toISOString()
  };
}
