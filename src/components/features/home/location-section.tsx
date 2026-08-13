import Link from "next/link";

import { ResponsiveSiteImage } from "@/components/shared/responsive-site-image";

import { IconClock, IconMap, IconMapPin } from "@/components/shared/site-icons";
import { getBusinessMapsSearchUrl } from "@/data/business";
import { LOCATION_EXTERIOR_IMAGE } from "@/data/site-images.registry";
import { getLocalizedMessages } from "@/i18n/get-localized-messages";
import { getServerLocale } from "@/i18n/get-locale";
import { resolveImageAlt } from "@/lib/image-alt";
import { resolveSiteImagePair } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

type LocationSectionProps = {
  siteImages?: SiteImagesMap;
};

export async function LocationSection({ siteImages }: LocationSectionProps) {
  const locale = await getServerLocale();
  const t = await getLocalizedMessages(locale);
  const exteriorImages = resolveSiteImagePair(
    siteImages,
    "location-exterior",
    LOCATION_EXTERIOR_IMAGE
  );
  const imageAlt = resolveImageAlt({
    kind: "location",
    locale,
    customAlt: t.location.imageAlt
  });
  const mapsUrl = getBusinessMapsSearchUrl();

  return (
    <section id="location" className="location-section" aria-labelledby="location-title">
      <div className="location-shell">
        <div className="location-copy">
          <h2 id="location-title" className="location-title" style={{ color: "#ffffff" }}>
            {t.location.title}
          </h2>

          <div
            className="location-block"
            style={{ color: "rgba(255, 247, 237, 0.86)" }}
          >
            <div className="location-block-head">
              <IconMapPin className="location-block-icon" />
              <h3>{t.location.locationHeading}</h3>
            </div>
            <p className="location-block-text">{t.location.address}</p>
            <p className="location-block-text">{t.location.businessType}</p>
            <p className="location-block-text">{t.location.kosher}</p>
            <p className="location-block-text">{t.location.parking}</p>
          </div>

          <div
            className="location-block"
            style={{ color: "rgba(255, 247, 237, 0.86)" }}
          >
            <div className="location-block-head">
              <IconClock className="location-block-icon" />
              <h3>{t.location.hoursHeading}</h3>
            </div>
            <dl className="location-hours">
              <div>
                <dt className="location-hours-day">{t.location.days.sunThu}</dt>
                <dd className="location-hours-time">{t.location.hours.sunThu}</dd>
              </div>
              {t.location.hours.fri ? (
                <div>
                  <dt className="location-hours-day">{t.location.days.fri}</dt>
                  <dd className="location-hours-time">{t.location.hours.fri}</dd>
                </div>
              ) : null}
              <div>
                <dt className="location-hours-day">{t.location.days.sat}</dt>
                <dd className="location-hours-time">{t.location.hours.sat}</dd>
              </div>
            </dl>
          </div>

          <div className="location-cta-group">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="location-cta"
            >
              <IconMap className="location-cta-icon" />
              <span>{t.location.navigate}</span>
            </a>
            <Link href="/locations" className="location-details-link">
              {t.location.viewBranchDetails}
            </Link>
          </div>
        </div>

        <div className="location-media">
          <ResponsiveSiteImage
            desktopSrc={exteriorImages.desktop}
            mobileSrc={exteriorImages.mobile}
            alt={imageAlt}
            className="location-media-image"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
