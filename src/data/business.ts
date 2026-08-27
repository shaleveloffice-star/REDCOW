/**
 * מקור מרכזי לפרטי העסק של NB BURGER.
 * נתונים מאושרים בלבד — אין placeholders או קישורים זמניים.
 */

export type BusinessLocale = "he" | "en" | "fr";

export type OpeningHoursInterval = {
  /** Schema.org / ISO weekday names */
  dayOfWeek: ReadonlyArray<
    "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"
  >;
  /** HH:mm — opens */
  opens: string;
  /**
   * HH:mm — closes.
   * `00:00` means midnight at the end of the service day (hours that cross midnight).
   */
  closes: string;
};

export const BUSINESS = {
  name: "NB BURGER",
  businessTypeHe: "מסעדת המבורגרים",
  cuisineHe: "המבורגרים",
  kosherHe: "כשר בהשגחת רבנות",

  address: {
    streetAddress: "רחוב אחוזה 96",
    addressLocality: "רעננה",
    addressCountry: "ישראל",
    /** Display string without country (site UI) */
    formatted: {
      he: "רחוב אחוזה 96, רעננה",
      en: "96 Ahuza St., Ra'anana",
      fr: "96 rue Ahuza, Ra'anana"
    } as const satisfies Record<BusinessLocale, string>,
    /** Full line for legal pages */
    formattedWithCountry: {
      he: "רחוב אחוזה 96, רעננה, ישראל",
      en: "96 Ahuza St., Ra'anana, Israel",
      fr: "96 rue Ahuza, Ra'anana, Israël"
    } as const satisfies Record<BusinessLocale, string>,
    /** Human-readable Google Maps query (display / fallback search) */
    mapsSearchQuery: "רחוב אחוזה 96, רעננה",
    /**
     * Canonical Google Maps share link for Ahuza St 96, Ra'anana
     * (resolves to place 0x151d381349a2601f:0xc3723ebd96727d1f).
     */
    mapsShareUrl: "https://maps.app.goo.gl/2r7TmeL53B7Dvza56",
    /** Precise pin from the share link (!3d / !4d) — used for embed without API key */
    mapsLat: 32.179996,
    mapsLng: 34.8777354
  },

  /** No approved phone yet — do not invent one */
  phone: null as string | null,

  email: "official.nbburger@gmail.com",

  website: "https://nbburger.co.il",

  social: {
    facebook: "https://www.facebook.com/profile.php?id=61590066758310",
    instagram: "https://www.instagram.com/nbburgeril/",
    tiktok: "https://www.tiktok.com/@nb.burg"
  },

  serviceOptions: {
    dineIn: true,
    delivery: true,
    /** No approved delivery URL yet */
    deliveryUrl: null as string | null,
    takeaway: false,
    /** No approved pickup URL yet */
    takeawayUrl: null as string | null
  },

  /**
   * Approved opening hours only.
   * Friday is intentionally omitted — no approved hours.
   * Intervals that close at `00:00` cross midnight into the next calendar day.
   */
  openingHours: [
    {
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "11:00",
      closes: "00:00"
    },
    {
      dayOfWeek: ["Saturday"],
      opens: "20:00",
      closes: "00:00"
    }
  ] as const satisfies ReadonlyArray<OpeningHoursInterval>,

  /** Display strings for the location hours UI (no Friday row) */
  displayHours: {
    weekday: "11:00–00:00",
    saturday: "20:00–00:00"
  } as const
} as const;

/** Opens Google Maps on the canonical place (share URL). */
export function getBusinessMapsSearchUrl(): string {
  return BUSINESS.address.mapsShareUrl;
}

/** Google Maps iframe src focused on the exact place pin (no API key). */
export function getBusinessMapsEmbedUrl(): string {
  const { mapsLat, mapsLng } = BUSINESS.address;
  return `https://www.google.com/maps?q=${mapsLat},${mapsLng}&hl=he&z=17&output=embed`;
}

export function getBusinessAddress(locale: BusinessLocale = "he"): string {
  return BUSINESS.address.formatted[locale];
}

export function getBusinessPhone(): string | null {
  return BUSINESS.phone;
}
