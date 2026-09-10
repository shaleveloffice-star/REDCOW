import { branchMapsEmbedUrl } from "@/data/business";

type LocationsMapProps = {
  title: string;
  branch?: import("@/types/content").Branch;
};

export function LocationsMap({ title, branch }: LocationsMapProps) {
  return (
    <iframe
      className="locations-map"
      src={branchMapsEmbedUrl(branch)}
      title={title}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
