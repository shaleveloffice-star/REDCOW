"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { LocationsMap } from "@/components/features/locations/locations-map";
import { MenuBreadcrumbs } from "@/components/features/menu/menu-breadcrumbs";
import { LabelWithNote } from "@/components/shared/label-with-note";
import { SeoContentBody, SeoCtaBlockView } from "@/components/shared/seo-content-body";
import { SeoFaqSection } from "@/components/shared/seo-faq-section";
import { IconLocationPinFilled } from "@/components/shared/site-icons";
import { BUSINESS, getBusinessMapsSearchUrl } from "@/data/business";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { hasValidFaqItems } from "@/lib/seo/faq-utils";
import { resolveImageAlt } from "@/lib/image-alt";
import { splitParagraphs } from "@/lib/seo-content/paragraphs";
import type { Branch } from "@/types/content";
import type { ResolvedSeoPageContent } from "@/types/seo-content";

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
      hours:
        locale === "he"
          ? `א׳–ה׳ ${BUSINESS.displayHours.weekday} · שבת ${BUSINESS.displayHours.saturday}`
          : locale === "fr"
            ? `Dim–Jeu ${BUSINESS.displayHours.weekday} · Sam ${BUSINESS.displayHours.saturday}`
            : `Sun–Thu ${BUSINESS.displayHours.weekday} · Sat ${BUSINESS.displayHours.saturday}`,
      mapsUrl: getBusinessMapsSearchUrl(),
      image: exteriorImage
    }
  ];
}

const INTRO_DASH_SPLIT = /\s—\s/;

function LocationsSeoIntro({ text }: { text: string }) {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length === 0) return null;

  return (
    <div className="locations-seo-intro">
      {paragraphs.map((paragraph, index) => {
        const [lead, detail] = paragraph.split(INTRO_DASH_SPLIT);
        if (detail?.trim()) {
          return (
            <LabelWithNote
              key={`${index}-${lead.slice(0, 24)}`}
              as="div"
              mainAs="p"
              noteAs="p"
              className="locations-seo-intro-split"
              label={lead.trim()}
              note={detail.trim()}
            />
          );
        }

        return (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        );
      })}
    </div>
  );
}

export function LocationsPageView({ branches, exteriorImage, seoContent }: LocationsPageViewProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const cards = useMemo(
    () => buildCards(branches, exteriorImage, locale),
    [branches, exteriorImage, locale]
  );

  return (
    <div className="locations-page">
      <header className="locations-page-head">
        <MenuBreadcrumbs
          items={[
            { label: t.nav.home, href: "/" },
            { label: t.locations.breadcrumbLabel }
          ]}
        />
        <h1 className="locations-page-title">{t.locations.pageTitle}</h1>
        <LocationsSeoIntro text={seoContent.introduction} />
      </header>

      <div className="locations-map-wrap">
        <LocationsMap title={t.locations.mapSummary} />
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
            {t.locations.deliveryZones.map((zone) => (
              <li key={`${zone.name}-${zone.areasNote ?? ""}`}>
                <article className="locations-delivery-tile">
                  <IconLocationPinFilled className="locations-delivery-tile-icon" aria-hidden="true" />
                  <div className="locations-delivery-tile-label">
                    <LabelWithNote
                      as="div"
                      mainAs="h3"
                      noteAs="p"
                      label={zone.name}
                      note={zone.areasNote}
                      className="ui-label-with-note--center"
                      mainClassName="locations-delivery-tile-name"
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <p className="locations-delivery-note">{t.locations.deliveryZonesNote}</p>
        </div>

        <p className="locations-back">
          <Link href="/">{t.locations.backHome}</Link>
        </p>

        <SeoContentBody text={seoContent.bottomContent} className="locations-seo-bottom" />

        <SeoCtaBlockView {...seoContent.cta} className="locations-seo-cta seo-content-cta" />
      </section>

      {hasValidFaqItems(seoContent.faq) ? (
        <SeoFaqSection faq={seoContent.faq} titleId="locations-faq-title" />
      ) : null}
    </div>
  );
}
