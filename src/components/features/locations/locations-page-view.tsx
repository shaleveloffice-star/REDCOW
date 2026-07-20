"use client";

import Image from "next/image";
import Link from "next/link";

import { IconLocationPinFilled } from "@/components/shared/site-icons";
import { BUSINESS, getBusinessMapsSearchUrl } from "@/data/business";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import type { Branch } from "@/types/content";

type LocationsPageViewProps = {
  branches: Branch[];
  exteriorImage: string;
};

type LocationCard = {
  id: string;
  name: string;
  address: string;
  hours: string;
  mapsUrl: string;
  image: string;
};

function buildCards(branches: Branch[], exteriorImage: string, locale: "he" | "en" | "fr"): LocationCard[] {
  if (branches.length > 0) {
    return branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
      address: `${branch.address}, ${branch.city}`,
      hours: branch.openingHours,
      mapsUrl: branch.wazeUrl || getBusinessMapsSearchUrl(),
      image: exteriorImage
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
      hours: `א׳–ה׳ ${BUSINESS.displayHours.weekday} · שבת ${BUSINESS.displayHours.saturday}`,
      mapsUrl: getBusinessMapsSearchUrl(),
      image: exteriorImage
    }
  ];
}

export function LocationsPageView({ branches, exteriorImage }: LocationsPageViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const cards = buildCards(branches, exteriorImage, locale);
  const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    BUSINESS.address.mapsSearchQuery
  )}&hl=${locale}&z=15&output=embed`;

  return (
    <div className="locations-page">
      <div className="locations-toolbar">
        <div className="locations-toolbar-title">
          <IconLocationPinFilled className="locations-toolbar-pin" />
          <span>{t.locations.findLocal}</span>
        </div>
      </div>

      <div className="locations-map-wrap">
        <iframe
          className="locations-map"
          title={t.locations.mapTitle}
          src={mapEmbedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="locations-map-marker" aria-hidden="true">
          <span className="locations-map-marker-pin">
            <span className="locations-map-marker-dot" />
          </span>
        </div>
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
                    alt={card.name}
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
        <p className="locations-back">
          <Link href="/">{t.locations.backHome}</Link>
        </p>
      </section>
    </div>
  );
}
