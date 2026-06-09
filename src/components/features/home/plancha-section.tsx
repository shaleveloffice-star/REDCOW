"use client";

import { motion } from "framer-motion";

import {
  PLANCHA_BITE_IMAGE,
  PLANCHA_MEAT_IMAGE,
  PLANCHA_SEAR_IMAGE
} from "@/data/site-images.registry";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

const steps = [
  {
    id: "plancha-meat",
    img: PLANCHA_MEAT_IMAGE,
    title: "הבשר",
    desc: "בשר שנטחן במקום, מתובל בעדינות ונכנס לפלנצ׳ה כשהוא טרי ומדויק."
  },
  {
    id: "plancha-sear",
    img: PLANCHA_SEAR_IMAGE,
    title: "הצריבה",
    desc: "חום גבוה, צריבה חזקה וקראסט שנותן לביס את האופי שלו."
  },
  {
    id: "plancha-bite",
    img: PLANCHA_BITE_IMAGE,
    title: "הביס",
    desc: "לחמנייה רכה, ירקות טריים ורוטב שמחבר הכול בלי להשתלט."
  }
];

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
          על הפלנצ׳ה
        </motion.h2>
        <motion.p
          className="plancha-lead"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          הבשר מגיע טרי, ניטחן במקום ועולה ישר לאש.
        </motion.p>
      </div>

      <ol className="plancha-panels" aria-label="שלבי הכנת הבורגר על הפלנצ׳ה">
        {steps.map((item, i) => {
          const src = pickSiteImage(siteImages, item.id, item.img);
          const textSide = i % 2 === 0 ? "left" : "right";

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
