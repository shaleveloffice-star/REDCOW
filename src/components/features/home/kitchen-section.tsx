"use client";

import { motion } from "framer-motion";

import {
  KITCHEN_BURGER_IMAGE,
  KITCHEN_GRILL_IMAGE,
  KITCHEN_SAUCES_IMAGE,
  KITCHEN_SIDES_IMAGE
} from "@/data/site-images.registry";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

const menuCards = [
  {
    id: "kitchen-burger",
    img: KITCHEN_BURGER_IMAGE,
    title: "המבורגרים",
    desc: "בשר שנטחן במקום, פלאצ׳ה לוהטת ולחמנייה רכה."
  },
  {
    id: "kitchen-sides",
    img: KITCHEN_SIDES_IMAGE,
    title: "תוספות",
    desc: "צ׳יפס פריך, מנות צד המות ודברים שסוגרים שולחן."
  },
  {
    id: "kitchen-sauces",
    img: KITCHEN_SAUCES_IMAGE,
    title: "רוטבים",
    desc: "רטבים מדויקים שמוסיפים טעם בלי לגנוב את ההצגה."
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

type KitchenSectionProps = {
  siteImages?: SiteImagesMap;
};

export function KitchenSection({ siteImages }: KitchenSectionProps) {
  const grillImage = pickSiteImage(siteImages, "kitchen-grill", KITCHEN_GRILL_IMAGE);
  return (
    <section id="kitchen" className="kitchen-section" aria-labelledby="kitchen-title">
      <div className="kitchen-intro">
        <motion.h2
          id="kitchen-title"
          className="kitchen-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          מה יוצא מהמטבח
        </motion.h2>
        <motion.p
          className="kitchen-lead"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          המבורגרים שנבנים נכון, תוספות המות,
          <br />
          צ׳יפס פריך ורוטבים שמחזיקים את הביס בלי להשתלט עליו.
        </motion.p>
      </div>

      <div className="kitchen-cards">
        {menuCards.map((card, index) => (
          <motion.article
            key={card.title}
            className="kitchen-card"
            custom={index}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="kitchen-card-media">
              <img src={pickSiteImage(siteImages, card.id, card.img)} alt={card.title} />
            </div>
            <div className="kitchen-card-body">
              <span className="kitchen-card-line" aria-hidden="true" />
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="kitchen-footer-media">
        <img src={grillImage} alt="מבחר מנות מהמטבח — המבורגר, תוספות ועוד" />
        <div className="kitchen-footer-scrim" aria-hidden="true" />
      </div>
    </section>
  );
}
