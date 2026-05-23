"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Phone } from "lucide-react";

import { LOCATION_EXTERIOR_IMAGE } from "@/data/site-images.registry";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

const MAPS_URL = "https://maps.google.com/?q=רח+המלאכה+12+נתניה";

type LocationSectionProps = {
  siteImages?: SiteImagesMap;
};

export function LocationSection({ siteImages }: LocationSectionProps) {
  const exteriorImage = pickSiteImage(siteImages, "location-exterior", LOCATION_EXTERIOR_IMAGE);
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
            style={{ color: "#fff7ed" }}
          >
            מיקום ושעות
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
              <h3>מיקום</h3>
            </div>
            <p className="location-block-text">רח׳ המלאכה 12, נתניה</p>
            <p className="location-block-text">חניה חופשית בשפע</p>
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
              <h3>שעות פתיחה</h3>
            </div>
            <dl className="location-hours">
              <div>
                <dt className="location-hours-day">ראשון - חמישי</dt>
                <dd className="location-hours-time">11:00 - 23:00</dd>
              </div>
              <div>
                <dt className="location-hours-day">שישי</dt>
                <dd className="location-hours-time">11:00 - סוף שעה לפני שבת</dd>
              </div>
              <div>
                <dt className="location-hours-day">שבת</dt>
                <dd className="location-hours-time">12:00 - 23:00</dd>
              </div>
            </dl>
          </motion.div>

          <motion.a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="location-cta"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Phone className="location-cta-icon" strokeWidth={1.5} aria-hidden="true" />
            <span>נווטו אלינו</span>
          </motion.a>
        </div>

        <motion.div
          className="location-media"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <img src={exteriorImage} alt="חזית המסעדה" />
        </motion.div>
      </div>
    </section>
  );
}
