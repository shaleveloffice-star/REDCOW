import { BUSINESS } from "@/data/business";

/** Compatibility for the previous approved schedule still saved in location copy.
 * Only known opening-hour phrases are migrated; other times and content stay intact.
 */
export function normalizeLocationHoursCopy(text: string): string {
  return text
    .replace(/11:00[–-]00:00/g, BUSINESS.displayHours.weekday)
    .replace(/21:00[–-]00:00/g, BUSINESS.displayHours.saturday)
    .replace(/(במוצאי שבת אנחנו פתוחים (?:החל מהשעה|מהשעה) )21:00/g, `$1${BUSINESS.openingHours[1].opens}`);
}
