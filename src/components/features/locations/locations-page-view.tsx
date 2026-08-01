"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { SeoContentBody, SeoCtaBlockView } from "@/components/shared/seo-content-body";
import { BUSINESS, getBusinessMapsSearchUrl } from "@/data/business";
import { PLANCHA_BURGERS_IMAGE } from "@/data/site-images.registry";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { resolveImageAlt, DECORATIVE_IMAGE_ALT } from "@/lib/image-alt";
import type { Branch } from "@/types/content";
import type { ResolvedSeoPageContent } from "@/types/seo-content";

const LocationsMap = dynamic(
  () =>
    import("@/components/features/locations/locations-map").then((mod) => ({
      default: mod.LocationsMap
    })),
  {
    ssr: false,
    loading: () => <div className="locations-map locations-map--loading" aria-hidden="true" />
  }
);

type LocationsPageViewProps = {
  branches: Branch[];
  exteriorImage: string;
  seoContent: ResolvedSeoPageContent;
};

type LocationCard = {
  id: string;
  name: string;
  address: string;
  hours: string;
  mapsUrl: string;
  image: string;
  lat: number;
  lng: number;
};

/** Default pin: Ahuza 96, Ra'anana */
const DEFAULT_COORDS = { lat: 32.1849, lng: 34.8709 };

function buildCards(branches: Branch[], exteriorImage: string, locale: "he" | "en" | "fr"): LocationCard[] {
  if (branches.length > 0) {
    return branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
      address: `${branch.address}, ${branch.city}`,
      hours: branch.openingHours,
      mapsUrl: branch.wazeUrl || getBusinessMapsSearchUrl(),
      image: exteriorImage,
      lat: DEFAULT_COORDS.lat,
      lng: DEFAULT_COORDS.lng
    }));
  }

  return [
    {
      id: "primary",
      name: `${BUSINESS.name} ${BUSINESS.address.addressLocality}`,
      address:
        locale === "he"
          ? BUSINESS.address.formatted.he
          : locale === "fr"
            ? BUSINESS.address.formatted.fr
            : BUSINESS.address.formatted.en,
      hours:
        locale === "he"
          ? `א׳–ה׳ ${BUSINESS.displayHours.weekday} · שבת ${BUSINESS.displayHours.saturday}`
          : locale === "fr"
            ? `Dim–Jeu ${BUSINESS.displayHours.weekday} · Sam ${BUSINESS.displayHours.saturday}`
            : `Sun–Thu ${BUSINESS.displayHours.weekday} · Sat ${BUSINESS.displayHours.saturday}`,
      mapsUrl: getBusinessMapsSearchUrl(),
      image: exteriorImage,
      lat: DEFAULT_COORDS.lat,
      lng: DEFAULT_COORDS.lng
    }
  ];
}

export function LocationsPageView({ branches, exteriorImage, seoContent }: LocationsPageViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const cards = useMemo(
    () => buildCards(branches, exteriorImage, locale),
    [branches, exteriorImage, locale]
  );
  const mapPoints = useMemo(
    () =>
      cards.map((card) => ({
        id: card.id,
        name: card.name,
        lat: card.lat,
        lng: card.lng
      })),
    [cards]
  );

  return (
    <div className="locations-page">
      <SeoContentBody text={seoContent.introduction} className="locations-seo-intro" />

      <div className="locations-map-wrap">
        <LocationsMap points={mapPoints} />
      </div>

      <section className="locations-list" aria-labelledby="locations-heading">
        <h2 id="locations-heading" className="locations-list-title">
          {t.locations.ourLocations}
        </h2>
        <ul className="locations-grid">
          {cards.map((card) => (
            <li key={card.id}>
              <article className="locations-card">
                <div className="locations-card-media">
                  <Image
                    src={card.image}
                    alt={resolveImageAlt({
                      kind: "branch",
                      locale,
                      branchName: card.name
                    })}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="locations-card-image"
                  />
                </div>
                <h3 className="locations-card-name">{card.name}</h3>
                <p className="locations-card-address">{card.address}</p>
                <p className="locations-card-hours">{card.hours}</p>
                <a
                  className="locations-card-link"
                  href={card.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.locations.navigate}
                </a>
              </article>
            </li>
          ))}
        </ul>

        <div className="locations-delivery">
          <h2 className="locations-list-title">{t.locations.deliveryZonesTitle}</h2>
          <ul className="locations-delivery-grid">
            {t.locations.deliveryZones.map((city) => (
              <li key={city}>
                <article className="locations-delivery-tile">
                  <Image
                    src={PLANCHA_BURGERS_IMAGE}
                    alt={DECORATIVE_IMAGE_ALT}
                    aria-hidden="true"
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                    className="locations-delivery-tile-image"
                  />
                  <span className="locations-delivery-tile-scrim" aria-hidden="true" />
                  <h3 className="locations-delivery-tile-name">{city}</h3>
                </article>
              </li>
            ))}
          </ul>
        </div>

        <p className="locations-back">
          <Link href="/">{t.locations.backHome}</Link>
        </p>

        <SeoContentBody text={seoContent.bottomContent} className="locations-seo-bottom" />
        <SeoCtaBlockView {...seoContent.cta} className="locations-seo-cta seo-content-cta" />
      </section>
    </div>
  );
}
