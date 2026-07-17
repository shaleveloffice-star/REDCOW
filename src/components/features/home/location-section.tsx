"use client";

import { motion } from "framer-motion";
import { Clock, Map, MapPin } from "lucide-react";

import { useTranslations } from "@/components/providers/locale-provider";
import { getBusinessMapsSearchUrl } from "@/data/business";
import { LOCATION_EXTERIOR_IMAGE } from "@/data/site-images.registry";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

type LocationSectionProps = {
  siteImages?: SiteImagesMap;
};

export function LocationSection({ siteImages }: LocationSectionProps) {
  const t = useTranslations();
  const exteriorImage = pickSiteImage(siteImages, "location-exterior", LOCATION_EXTERIOR_IMAGE);
  const mapsUrl = getBusinessMapsSearchUrl();

  return (
    <section id="location" className="location-section" aria-labelledby="location-title">
      <div className="location-shell">
        <div className="location-copy">
          <motion.h2
            id="location-title"
            className="location-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ color: "#ffffff" }}
          >
            {t.location.title}
          </motion.h2>

          <motion.div
            className="location-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{ color: "rgba(255, 247, 237, 0.68)" }}
          >
            <div className="location-block-head">
              <MapPin className="location-block-icon" strokeWidth={1.5} aria-hidden="true" />
              <h3>{t.location.locationHeading}</h3>
            </div>
            <p className="location-block-text">{t.location.address}</p>
            <p className="location-block-text">{t.location.parking}</p>
          </motion.div>

          <motion.div
            className="location-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.7 }}
            style={{ color: "rgba(255, 247, 237, 0.68)" }}
          >
            <div className="location-block-head">
              <Clock className="location-block-icon" strokeWidth={1.5} aria-hidden="true" />
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
          </motion.div>

          <motion.a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="location-cta"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Map className="location-cta-icon" strokeWidth={1.5} aria-hidden="true" />
            <span>{t.location.navigate}</span>
          </motion.a>
        </div>

        <motion.div
          className="location-media"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <img src={exteriorImage} alt={t.location.imageAlt} />
        </motion.div>
      </div>
    </section>
  );
}
