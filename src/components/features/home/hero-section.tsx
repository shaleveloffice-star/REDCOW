"use client";

import type { OrderLink, SiteSettings } from "@/types/content";
import { motion, useReducedMotion } from "framer-motion";

import { HERO_DEFAULT_IMAGE_URL } from "@/data/site-images.registry";

const easeLuxury = [0.22, 1, 0.36, 1] as const;

export function HeroSection({
  settings,
  orderLinks
}: {
  settings: SiteSettings;
  orderLinks: OrderLink[];
}) {
  const reduceMotion = useReducedMotion();
  const heroMediaUrl = settings.heroMediaUrl || HERO_DEFAULT_IMAGE_URL;
  const heroMediaType = settings.heroMediaUrl ? settings.heroMediaType : "image";
  const hasHeroMedia = heroMediaType !== "none" && heroMediaUrl.length > 0;
  const primaryOrderLink = orderLinks[0];

  const fadeUp = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: easeLuxury }
        };

  return (
    <section id="hero" className="hero hero--cinematic">
      <div className="hero-visual" aria-label={settings.heroMediaAlt}>
        <div className={`hero-visual-media${reduceMotion ? "" : " hero-visual-media--alive"}`}>
          {hasHeroMedia ? (
            heroMediaType === "video" ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="hero-media"
                src={heroMediaUrl}
              />
            ) : (
              <img className="hero-media" alt={settings.heroMediaAlt} src={heroMediaUrl} />
            )
          ) : (
            <div className="hero-burger-placeholder" aria-hidden="true" />
          )}
        </div>
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
      </div>

      <div className="hero-inner">
        <div className="hero-content">
          <motion.div
            className="hero-ornament"
            aria-hidden="true"
            {...fadeUp(0.15)}
          >
            <span className="hero-ornament-line" />
            <span className="hero-ornament-icon" aria-hidden="true">
              <svg viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 9.5c0-3.8 6.2-5.5 14-5.5s14 1.7 14 5.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
                <path d="M9 13.5h22" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M8 16h24" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M9 18.5h22" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path
                  d="M6 19.5c0 3.6 6.2 5.5 14 5.5s14-1.9 14-5.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="hero-ornament-line" />
          </motion.div>

          <motion.p className="hero-tagline hero-tagline--1" {...fadeUp(0.25)}>
            בשרים שנטחן במקום
          </motion.p>
          <motion.p className="hero-tagline hero-tagline--2" {...fadeUp(0.38)}>
            פלאנצ&apos;ה לוהטת
          </motion.p>

          <motion.h1 className="hero-title" {...fadeUp(0.62)}>
            <span className="hero-title-word">NB</span>
            <span className="hero-title-word hero-title-word--accent">BURGER</span>
          </motion.h1>

          <motion.div className="hero-title-shine" aria-hidden="true" {...fadeUp(0.72)} />

          <motion.div className="hero-actions" {...fadeUp(0.85)}>
            <a className="hero-button hero-button--menu" href="#menu">
              לתפריט
            </a>
            <a
              className="hero-button hero-button--order"
              href={primaryOrderLink?.url ?? "#menu"}
              {...(primaryOrderLink
                ? { rel: "noopener noreferrer", target: "_blank" }
                : {})}
            >
              להזמנה
            </a>
          </motion.div>
        </div>
      </div>

      <a className="hero-scroll" href="#plancha" aria-label="גלול למטה">
        <span className="hero-scroll-label">גלול</span>
        <svg
          className="hero-scroll-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
