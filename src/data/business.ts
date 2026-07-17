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
    /** Google Maps search query — not a Google Business Profile URL */
    mapsSearchQuery: "רחוב אחוזה 96, רעננה"
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

export function getBusinessMapsSearchUrl(): string {
  return `https://maps.google.com/?q=${encodeURIComponent(BUSINESS.address.mapsSearchQuery)}`;
}

export function getBusinessAddress(locale: BusinessLocale = "he"): string {
  return BUSINESS.address.formatted[locale];
}

export function getBusinessPhone(): string | null {
  return BUSINESS.phone;
}
