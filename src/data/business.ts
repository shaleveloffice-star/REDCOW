import { ORDER_URL } from "@/lib/orders";
/**
 * מקור מרכזי לפרטי העסק של SO WHAT.
 * נתונים מאושרים בלבד — אין placeholders או קישורים זמניים.
 */

import type { Branch } from "@/types/content";
import { CANONICAL_SITE_ORIGIN } from "@/data/site-domain";

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
  name: "SO WHAT",
  fullName: "SO WHAT BURGER",
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
     * Canonical Google Maps place link for Ahuza St 96, Ra'anana
     * (place 0x151d381349a2601f:0xc3723ebd96727d1f).
     */
    mapsShareUrl:
      "https://www.google.com/maps/place/%D7%90%D7%97%D7%95%D7%96%D7%94+96,+%D7%A8%D7%A2%D7%A0%D7%A0%D7%94/@32.179996,34.8777354,17z/data=!3m1!4b1!4m6!3m5!1s0x151d381349a2601f:0xc3723ebd96727d1f!8m2!3d32.179996!4d34.8777354!16s%2Fg%2F11ggb9n2_6",
    /** Precise pin from the place link (!3d / !4d) — used for embed without API key */
    mapsLat: 32.179996,
    mapsLng: 34.8777354
  },

  phone: "077-303-4390",

  email: "swhat.burger@gmail.com",

  website: CANONICAL_SITE_ORIGIN,

  social: {
    facebook: "https://www.facebook.com/SOWHAT.IL",
    instagram: "https://www.instagram.com/sowhat.il/",
    tiktok: "https://www.tiktok.com/@sowhat.il"
  },

  serviceOptions: {
    dineIn: true,
    delivery: true,
    /** Approved ordering provider */
    deliveryUrl: ORDER_URL,
    takeaway: true,
    /** Approved ordering provider */
    takeawayUrl: ORDER_URL
  },

  /**
   * Approved opening hours only.
   * Friday is closed and therefore omitted from the open intervals.
   */
  openingHours: [
    {
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "12:00",
      closes: "00:00"
    },
    {
      dayOfWeek: ["Saturday"],
      opens: "19:00",
      closes: "00:00"
    }
  ] as const satisfies ReadonlyArray<OpeningHoursInterval>,

  /** Display strings for the location hours UI */
  displayHours: {
    weekday: "12:00–00:00",
    saturday: "19:00–00:00"
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

/** Truncated CMS typo "אחוזה 9" must not override the real Ra'anana pin at 96. */
function isRaAnanaAhuzaTypo(address: string, city: string): boolean {
  return /רעננה/.test(city.trim()) && /אחוזה\s*0*9(?!\d)/.test(address.trim());
}

export function isPrimaryRaAnanaBranch(branch?: Branch): boolean {
  if (!branch) return true;
  const city = branch.city.trim();
  const address = branch.address.trim();
  if (city !== BUSINESS.address.addressLocality) return false;
  return (
    address === BUSINESS.address.streetAddress ||
    /אחוזה\s*96/.test(address) ||
    isRaAnanaAhuzaTypo(address, city)
  );
}

/** Normalize known Ra'anana address/map typos before display or save. */
export function normalizeBranchLocation(branch: Branch): Branch {
  if (!isPrimaryRaAnanaBranch(branch)) return branch;

  return {
    ...branch,
    address: BUSINESS.address.streetAddress,
    city: BUSINESS.address.addressLocality,
    wazeUrl: getBusinessMapsSearchUrl()
  };
}

export function branchAddress(branch: Branch | undefined, locale: BusinessLocale = "he"): string {
  const normalized = branch ? normalizeBranchLocation(branch) : undefined;
  if (
    !normalized ||
    (normalized.address === BUSINESS.address.streetAddress &&
      normalized.city === BUSINESS.address.addressLocality)
  ) {
    return getBusinessAddress(locale);
  }
  return [normalized.address, normalized.city].filter(Boolean).join(", ");
}

export function branchMapsUrl(branch?: Branch): string {
  if (!branch || isPrimaryRaAnanaBranch(branch)) return getBusinessMapsSearchUrl();
  const normalized = normalizeBranchLocation(branch);
  const customMapsUrl = normalized.wazeUrl.trim();
  // Stale default Maps URL on a relocated branch should not override the new address search.
  if (customMapsUrl && customMapsUrl !== getBusinessMapsSearchUrl()) return customMapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branchAddress(normalized))}`;
}

export function branchMapsEmbedUrl(branch?: Branch): string {
  if (!branch || isPrimaryRaAnanaBranch(branch)) return getBusinessMapsEmbedUrl();
  return `https://www.google.com/maps?q=${encodeURIComponent(branchAddress(branch))}&hl=he&z=17&output=embed`;
}

export function usesDefaultBranchHours(branch?: Branch): boolean {
  return !branch || branch.openingHours === getBusinessHoursText() || isLegacyBusinessHours(branch.openingHours);
}

/** Exact historical defaults only; custom admin schedules remain editable. */
export function isLegacyBusinessHours(hours: string): boolean {
  return [
    "א׳–ה׳ 11:00–00:00 · שישי סגור · שבת 21:00–00:00",
    "Sun–Thu 11:00–00:00 · Friday closed · Sat 21:00–00:00",
    "Dim–Jeu 11:00–00:00 · Vendredi fermé · Sam 21:00–00:00",
    "א׳–ה׳ 11:00–00:00 · שבת 20:00–00:00",
    "א׳–ה׳ 11:00–00:00 · שישי סגור · שבת 20:00–00:00",
    "Sun–Thu 11:00–00:00 · Friday closed · Sat 20:00–00:00",
    "Dim–Jeu 11:00–00:00 · Vendredi fermé · Sam 20:00–00:00",
    "א׳–ה׳ 11:00–23:00 · שישי סגור · שבת 20:00–23:00",
    "Sun–Thu 11:00–23:00 · Friday closed · Sat 20:00–23:00",
    "Dim–Jeu 11:00–23:00 · Vendredi fermé · Sam 20:00–23:00"
  ].includes(hours);
}

export function getBusinessHoursText(locale: BusinessLocale = "he"): string {
  const { weekday, saturday } = BUSINESS.displayHours;
  if (locale === "en") return `Sun–Thu ${weekday} · Friday closed · Sat ${saturday}`;
  if (locale === "fr") return `Dim–Jeu ${weekday} · Vendredi fermé · Sam ${saturday}`;
  return `א׳–ה׳ ${weekday} · שישי סגור · שבת ${saturday}`;
}
