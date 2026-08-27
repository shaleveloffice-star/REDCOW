import { BUSINESS } from "@/data/business";

type LocationsMapProps = {
  title: string;
};

/** Google Maps embed (no API key) focused on the primary branch address. */
export function getLocationsMapEmbedSrc(): string {
  const query = encodeURIComponent(BUSINESS.address.mapsSearchQuery);
  return `https://www.google.com/maps?q=${query}&hl=he&z=16&output=embed`;
}

export function LocationsMap({ title }: LocationsMapProps) {
  return (
    <iframe
      className="locations-map"
      src={getLocationsMapEmbedSrc()}
      title={title}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
