"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { useTranslations } from "@/components/providers/locale-provider";
import {
  PLANCHA_BITE_IMAGE,
  PLANCHA_MEAT_IMAGE,
  PLANCHA_SEAR_IMAGE
} from "@/data/site-images.registry";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

const stepIds = ["plancha-meat", "plancha-sear", "plancha-bite"] as const;
const stepImages = [PLANCHA_MEAT_IMAGE, PLANCHA_SEAR_IMAGE, PLANCHA_BITE_IMAGE] as const;

const easeLuxury = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.12, duration: 0.75, ease: easeLuxury }
  })
};

type PlanchaSectionProps = {
  siteImages?: SiteImagesMap;
};

export function PlanchaSection({ siteImages }: PlanchaSectionProps) {
  const t = useTranslations();

  const steps = useMemo(
    () =>
      stepIds.map((id, index) => ({
        id,
        img: stepImages[index],
        title: t.plancha.steps[index]?.title ?? "",
        desc: t.plancha.steps[index]?.desc ?? ""
      })),
    [t]
  );

  return (
    <section id="plancha" className="plancha-section" aria-labelledby="plancha-title">
      <div className="plancha-intro">
        <motion.h2
          id="plancha-title"
          className="plancha-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {t.plancha.title}
        </motion.h2>
        <motion.p
          className="plancha-lead"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {t.plancha.lead}
        </motion.p>
      </div>

      <ol className="plancha-panels" aria-label={t.plancha.listAria}>
        {steps.map((item, i) => {
          const src = pickSiteImage(siteImages, item.id, item.img);
          const textSide =
            item.id === "plancha-bite" ? "right" : i % 2 === 0 ? "left" : "right";

          return (
            <motion.li
              key={item.id}
              className={`plancha-panel plancha-panel--text-${textSide} plancha-panel--${item.id}`}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-8%" }}
            >
              <article className="plancha-panel-frame">
                <div className="plancha-panel-copy">
                  <h3 className="plancha-panel-title">{item.title}</h3>
                  <p className="plancha-panel-desc">{item.desc}</p>
                </div>
                {src ? (
                  <div className="plancha-panel-media">
                    <img src={src} alt={item.title} loading="lazy" decoding="async" />
                  </div>
                ) : null}
              </article>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
