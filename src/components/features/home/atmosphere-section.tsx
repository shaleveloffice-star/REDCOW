"use client";

import { motion } from "framer-motion";

import {
  ATMOSPHERE_FOOD_IMAGE,
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
  const atmosphereTopImage = pickSiteImage(siteImages, "atmosphere-wide", ATMOSPHERE_WIDE_IMAGE);
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
          <div className="atmosphere-burger-stack">
            <div className="atmosphere-gallery-grid">
              <motion.div
                className="atmosphere-gallery-item atmosphere-gallery-item--wide atmosphere-gallery-item--bun-top"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <img src={atmosphereTopImage} alt="לחמנייה עליונה" />
              </motion.div>
              <motion.div
                className={`atmosphere-gallery-item atmosphere-gallery-item--bottom-panel atmosphere-gallery-item--bottom-video${atmosphereFoodIsVideo ? " atmosphere-gallery-item--video" : ""}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45, duration: 0.7 }}
              >
                {atmosphereFoodIsVideo ? (
                  <video
                    className="atmosphere-gallery-video"
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
              <motion.div
                className="atmosphere-gallery-item atmosphere-gallery-item--wide atmosphere-gallery-item--bun-bottom"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55, duration: 0.7 }}
              >
                <img src={atmosphereTopImage} alt={t.atmosphere.bottomAlt} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
