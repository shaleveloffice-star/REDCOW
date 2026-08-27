import { getBusinessMapsEmbedUrl } from "@/data/business";

type LocationsMapProps = {
  title: string;
};

export function LocationsMap({ title }: LocationsMapProps) {
  return (
    <iframe
      className="locations-map"
      src={getBusinessMapsEmbedUrl()}
      title={title}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
