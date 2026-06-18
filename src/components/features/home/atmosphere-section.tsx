"use client";

import { motion } from "framer-motion";

import {
  ATMOSPHERE_FOOD_IMAGE,
  ATMOSPHERE_PEOPLE_IMAGE,
  ATMOSPHERE_SIGN_IMAGE,
  ATMOSPHERE_WIDE_IMAGE
} from "@/data/site-images.registry";
import { pickSiteImage } from "@/lib/site-image-url";
import { useTranslations } from "@/components/providers/locale-provider";
import type { SiteImagesMap } from "@/types/site-images";

type AtmosphereSectionProps = {
  siteImages?: SiteImagesMap;
};

export function AtmosphereSection({ siteImages }: AtmosphereSectionProps) {
  const t = useTranslations();

  return (
    <section id="atmosphere" className="atmosphere-section" aria-labelledby="atmosphere-title">
      <div className="atmosphere-shell">
        <div className="atmosphere-copy">
          <motion.h2
            id="atmosphere-title"
            className="atmosphere-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {t.atmosphere.title}
          </motion.h2>
          <motion.p
            className="atmosphere-lead"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {t.atmosphere.leadLine1}
            <br />
            {t.atmosphere.leadLine2}
          </motion.p>
        </div>

        <div className="atmosphere-gallery">
          <div className="atmosphere-gallery-grid">
            <motion.div
              className="atmosphere-gallery-item atmosphere-gallery-item--wide"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <img src={pickSiteImage(siteImages, "atmosphere-wide", ATMOSPHERE_WIDE_IMAGE)} alt="אווירה במסעדה" />
            </motion.div>
            <motion.div
              className="atmosphere-gallery-item"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.7 }}
            >
              <img src={pickSiteImage(siteImages, "atmosphere-people", ATMOSPHERE_PEOPLE_IMAGE)} alt="אנשים נהנים" />
            </motion.div>
            <motion.div
              className="atmosphere-gallery-item"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <img src={pickSiteImage(siteImages, "atmosphere-sign", ATMOSPHERE_SIGN_IMAGE)} alt="שלט NB Burger" />
            </motion.div>
            <motion.div
              className="atmosphere-gallery-item atmosphere-gallery-item--wide"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              <img src={pickSiteImage(siteImages, "atmosphere-food", ATMOSPHERE_FOOD_IMAGE)} alt="אוכל במסעדה" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
