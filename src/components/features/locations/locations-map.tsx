import { ExternalContentConsent } from "@/components/shared/external-content-consent";
import { branchMapsEmbedUrl } from "@/data/business";

type LocationsMapProps = {
  title: string;
  branch?: import("@/types/content").Branch;
};

export function LocationsMap({ title, branch }: LocationsMapProps) {
  return (
    <ExternalContentConsent provider="Google Maps" className="locations-map"><iframe
      className="locations-map"
      src={branchMapsEmbedUrl(branch)}
      title={title}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer"
    /></ExternalContentConsent>
  );
}
