"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";

import { BurgerAssemblyStage } from "@/components/features/home/burger-assembly-section";
import { AutoplayVideo } from "@/components/shared/autoplay-video";
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
  sectionId?: string;
};

type AtmosphereBurgerStackProps = {
  reduceMotion: boolean | null;
  animateOnScroll?: boolean;
  children: React.ReactNode;
};

function AtmosphereBurgerStack({
  reduceMotion,
  animateOnScroll = true,
  children
}: AtmosphereBurgerStackProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start 0.92", "start 0.38"]
  });

  const scaleRaw = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [0.52, 1.2]
  );
  const opacityRaw = useTransform(
    scrollYProgress,
    [0, 0.25, 1],
    reduceMotion ? [1, 1, 1] : [0.2, 0.82, 1]
  );
  const yRaw = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [72, 0]);

  const scale = useSpring(scaleRaw, { stiffness: 90, damping: 22, mass: 0.85 });
  const opacity = useSpring(opacityRaw, { stiffness: 120, damping: 28, mass: 0.7 });
  const y = useSpring(yRaw, { stiffness: 100, damping: 24, mass: 0.8 });

  if (!animateOnScroll || reduceMotion) {
    return (
      <div ref={stackRef} className="atmosphere-burger-stack">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={stackRef}
      className="atmosphere-burger-stack"
      style={reduceMotion ? undefined : { scale, opacity, y }}
    >
      {children}
    </motion.div>
  );
}

export function AtmosphereSection({
  siteImages,
  sectionId = "atmosphere"
}: AtmosphereSectionProps) {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();
  const titleId = `${sectionId}-title`;
  const isIntroSection = sectionId === "atmosphere";
  const atmosphereFoodMedia = pickSiteImage(
    siteImages,
    "atmosphere-food",
    ATMOSPHERE_FOOD_IMAGE
  );
  const atmosphereTopImage = pickSiteImage(siteImages, "atmosphere-wide", ATMOSPHERE_WIDE_IMAGE);
  const atmosphereFoodIsVideo = !isIntroSection && isVideoMediaUrl(atmosphereFoodMedia);

  return (
    <section
      id={sectionId}
      className={`atmosphere-section${isIntroSection ? " atmosphere-section--intro" : ""}`}
      aria-labelledby={titleId}
    >
      <div className={`atmosphere-shell${isIntroSection ? " atmosphere-shell--intro" : ""}`}>
        {isIntroSection ? (
          <>
            <div className="atmosphere-intro-copy">
              <motion.h2
                id={titleId}
                className="atmosphere-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {t.atmosphere.introTitle}
              </motion.h2>
              <motion.p
                className="atmosphere-lead"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                {t.atmosphere.introLead}
              </motion.p>
            </div>
            <div className="atmosphere-gallery">
              <AtmosphereBurgerStack reduceMotion={reduceMotion} animateOnScroll={false}>
                <div className="atmosphere-gallery-item atmosphere-gallery-item--burger-single burger-assembly--embedded">
                  <BurgerAssemblyStage />
                </div>
              </AtmosphereBurgerStack>
            </div>
          </>
        ) : (
          <>
            <div className="atmosphere-copy">
              <motion.h2
                id={titleId}
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
              <AtmosphereBurgerStack reduceMotion={reduceMotion}>
                <div className="atmosphere-gallery-grid">
                  <div className="atmosphere-gallery-item atmosphere-gallery-item--wide atmosphere-gallery-item--bun-top">
                    <img src={atmosphereTopImage} alt="לחמנייה עליונה" />
                  </div>
                  <div
                    className={`atmosphere-gallery-item atmosphere-gallery-item--bottom-panel atmosphere-gallery-item--bottom-video${atmosphereFoodIsVideo ? " atmosphere-gallery-item--video" : ""}`}
                  >
                    {atmosphereFoodIsVideo ? (
                      <AutoplayVideo
                        className="atmosphere-gallery-video"
                        src={atmosphereFoodMedia}
                        poster={atmosphereTopImage}
                        aria-label={t.atmosphere.droneAlt}
                      />
                    ) : (
                      <img src={atmosphereFoodMedia} alt={t.atmosphere.droneAlt} />
                    )}
                  </div>
                  <div className="atmosphere-gallery-item atmosphere-gallery-item--wide atmosphere-gallery-item--bun-bottom">
                    <img src={atmosphereTopImage} alt={t.atmosphere.bottomAlt} />
                  </div>
                </div>
              </AtmosphereBurgerStack>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
