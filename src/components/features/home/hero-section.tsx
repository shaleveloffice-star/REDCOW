"use client";

import type { OrderLink, SiteSettings } from "@/types/content";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  HERO_DEFAULT_POSTER_URL,
  HERO_DEFAULT_VIDEO_URL
} from "@/data/site-images.registry";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslations } from "@/components/providers/locale-provider";

const easeLuxury = [0.22, 1, 0.36, 1] as const;

type HeroVideoProps = {
  src: string;
  poster: string;
  alt: string;
  reduceMotion: boolean | null;
};

function HeroVideo({ src, poster, alt, reduceMotion }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => setVideoReady(true);

    const tryPlay = () => {
      void video.play().catch(() => {});
    };

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    video.addEventListener("loadedmetadata", tryPlay);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }

    tryPlay();

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("loadedmetadata", tryPlay);
    };
  }, [src]);

  return (
    <>
      <img
        className={`hero-media hero-media--poster${videoReady ? " is-hidden" : ""}`}
        src={poster}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
      />
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={poster}
        className={`hero-media hero-media--video${videoReady ? " is-ready" : ""}${
          reduceMotion ? " hero-media--video-static" : ""
        }`}
        src={src}
        aria-label={alt}
      />
    </>
  );
}

export function HeroSection({
  settings,
  orderLinks
}: {
  settings: SiteSettings;
  orderLinks: OrderLink[];
}) {
  const reduceMotion = useReducedMotion();
  const t = useTranslations();
  const heroMediaUrl = settings.heroMediaUrl || HERO_DEFAULT_VIDEO_URL;
  const heroMediaType = settings.heroMediaUrl ? settings.heroMediaType : "video";
  const heroPosterUrl = HERO_DEFAULT_POSTER_URL;
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
              <HeroVideo
                src={heroMediaUrl}
                poster={heroPosterUrl}
                alt={settings.heroMediaAlt}
                reduceMotion={reduceMotion}
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
        <div className="hero-bottom-fade" aria-hidden="true" />
      </div>

      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-brand">
            <motion.h1 className="hero-title" {...fadeUp(0.62)}>
              <img
                className="hero-logo"
                src="/images/brand/nb-burger-wordmark-alpha.png?v=4"
                alt="NB BURGER"
                width={520}
                height={230}
              />
            </motion.h1>

            <motion.p className="hero-tagline hero-tagline--below" {...fadeUp(0.72)}>
              {t.hero.tagline}
            </motion.p>
          </div>

          <motion.div className="hero-actions" {...fadeUp(0.9)}>
            <a className="hero-button hero-button--menu" href="#menu">
              {t.hero.menuCta}
            </a>
            <a
              className="hero-button hero-button--order"
              href={primaryOrderLink?.url ?? "#menu"}
              {...(primaryOrderLink
                ? { rel: "noopener noreferrer", target: "_blank" }
                : {})}
            >
              {t.hero.orderCta}
            </a>
            <div className="hero-language-switcher">
              <LanguageSwitcher />
            </div>
          </motion.div>
        </div>
      </div>

      <a className="hero-scroll" href="#plancha" aria-label={t.hero.scrollAria}>
        <span className="hero-scroll-label">{t.hero.scroll}</span>
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
