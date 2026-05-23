"use client";

import { motion } from "framer-motion";

import {
  PLANCHA_BITE_IMAGE,
  PLANCHA_BURGERS_IMAGE,
  PLANCHA_HERO_IMAGE,
  PLANCHA_MEAT_IMAGE,
  PLANCHA_SEAR_IMAGE
} from "@/data/site-images.registry";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

const cards = [
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

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.15, duration: 0.7 }
  })
};

type PlanchaSectionProps = {
  siteImages?: SiteImagesMap;
};

export function PlanchaSection({ siteImages }: PlanchaSectionProps) {
  const heroImage = pickSiteImage(siteImages, "plancha-hero", PLANCHA_HERO_IMAGE);
  const footerImage = pickSiteImage(siteImages, "plancha-burgers", PLANCHA_BURGERS_IMAGE);

  return (
    <section id="plancha" className="plancha-section" aria-labelledby="plancha-title">
      <div className="plancha-hero-media">
        {heroImage ? <img src={heroImage} alt="הפלנצ׳ה" /> : null}
        <div className="plancha-hero-scrim plancha-hero-scrim--top" aria-hidden="true" />
      </div>

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
          בשר שנטחן במקום, חום גבוה וביס שנבנה בלי קיצורי דרך.
        </motion.p>
      </div>

      <div className="plancha-cards">
        {cards.map((card, index) => (
          <motion.article
            key={card.title}
            className="plancha-card"
            custom={index}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="plancha-card-media">
              {(() => {
                const src = pickSiteImage(siteImages, card.id, card.img);
                return src ? <img src={src} alt={card.title} /> : null;
              })()}
            </div>
            <div className="plancha-card-body">
              <span className="plancha-card-line" aria-hidden="true" />
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="plancha-footer-media">
        {footerImage ? <img src={footerImage} alt="מבחר המבורגרים" /> : null}
        <div className="plancha-hero-scrim plancha-hero-scrim--bottom" aria-hidden="true" />
        <div className="plancha-footer-cta-wrap">
          <a className="plancha-footer-cta" href="#kitchen">
            <span aria-hidden="true">←</span>
            <span>לתפריט שלנו</span>
          </a>
        </div>
      </div>
    </section>
  );
}
