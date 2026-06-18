"use client";

import { motion } from "framer-motion";

import {
  ATMOSPHERE_FOOD_IMAGE,
  ATMOSPHERE_PEOPLE_IMAGE,
  ATMOSPHERE_SIGN_IMAGE,
  ATMOSPHERE_WIDE_IMAGE
} from "@/data/site-images.registry";
import { pickSiteImage } from "@/lib/site-image-url";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { useTranslations } from "@/components/providers/locale-provider";
import type { SiteImagesMap } from "@/types/site-images";

type AtmosphereSectionProps = {
  siteImages?: SiteImagesMap;
};

export function AtmosphereSection({ siteImages }: AtmosphereSectionProps) {
  const t = useTranslations();
  const atmosphereFoodMedia = pickSiteImage(
    siteImages,
    "atmosphere-food",
    ATMOSPHERE_FOOD_IMAGE
  );
  const atmosphereFoodIsVideo = isVideoMediaUrl(atmosphereFoodMedia);

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
          <div className="atmosphere-burger" aria-label={t.atmosphere.burgerAria}>
            <motion.div
              className="atmosphere-burger-layer atmosphere-burger-bun atmosphere-burger-bun--top"
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <img
                src={pickSiteImage(siteImages, "atmosphere-wide", ATMOSPHERE_WIDE_IMAGE)}
                alt={t.atmosphere.wideAlt}
              />
            </motion.div>

            <div className="atmosphere-burger-fill">
              <motion.div
                className="atmosphere-burger-layer atmosphere-burger-patty"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.12, duration: 0.7 }}
              >
                <img
                  src={pickSiteImage(siteImages, "atmosphere-people", ATMOSPHERE_PEOPLE_IMAGE)}
                  alt={t.atmosphere.peopleAlt}
                />
              </motion.div>
              <motion.div
                className="atmosphere-burger-layer atmosphere-burger-lettuce"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.22, duration: 0.7 }}
              >
                <img
                  src={pickSiteImage(siteImages, "atmosphere-sign", ATMOSPHERE_SIGN_IMAGE)}
                  alt={t.atmosphere.signAlt}
                />
              </motion.div>
            </div>

            <motion.div
              className={`atmosphere-burger-layer atmosphere-burger-bun atmosphere-burger-bun--bottom${atmosphereFoodIsVideo ? " atmosphere-burger-bun--video" : ""}`}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.32, duration: 0.7 }}
            >
              {atmosphereFoodIsVideo ? (
                <video
                  className="atmosphere-burger-video"
                  src={atmosphereFoodMedia}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label={t.atmosphere.droneAlt}
                />
              ) : (
                <img src={atmosphereFoodMedia} alt={t.atmosphere.droneAlt} />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
