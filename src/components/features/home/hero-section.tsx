"use client";

import type { OrderLink, SiteSettings } from "@/types/content";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  HERO_DEFAULT_POSTER_URL,
  HERO_DEFAULT_VIDEO_URL
} from "@/data/site-images.registry";
import { BUSINESS } from "@/data/business";
import { SITE_WORDMARK_SRC, SITE_WORDMARK_WEBP_SRC } from "@/data/brand-assets";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslations } from "@/components/providers/locale-provider";
import { videoSourcesForMp4 } from "@/lib/video-sources";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

type HeroVideoProps = {
  src: string;
  poster: string;
  alt: string;
};

function scheduleDeferredWork(work: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(() => work(), { timeout: 2500 });
    return () => window.cancelIdleCallback(id);
  }

  const timeoutId = window.setTimeout(work, 1200);
  return () => window.clearTimeout(timeoutId);
}

function HeroVideo({ src, poster, alt }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [skipVideo, setSkipVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);

    if (reducedMotion || saveData) {
      setSkipVideo(true);
      return;
    }

    let cancelScheduled: (() => void) | undefined;

    const startDeferredLoad = () => {
      cancelScheduled = scheduleDeferredWork(() => {
        setShouldLoadVideo(true);
      });
    };

    if (document.readyState === "complete") {
      startDeferredLoad();
    } else {
      window.addEventListener("load", startDeferredLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", startDeferredLoad);
      cancelScheduled?.();
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo || skipVideo) return;

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

    video.load();
    tryPlay();

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("loadedmetadata", tryPlay);
    };
  }, [shouldLoadVideo, skipVideo, src]);

  return (
    <>
      <div
        className={`hero-media hero-media--poster${videoReady ? " is-hidden" : ""}`}
        aria-hidden="true"
      >
        <Image
          className="hero-poster-image"
          src={poster}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center center" }}
        />
      </div>
      {shouldLoadVideo && !skipVideo ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster={poster}
          className={`hero-media hero-media--video${videoReady ? " is-ready" : ""}`}
          aria-label={alt}
        >
          {videoSourcesForMp4(src).map((source) => (
            <source key={source.type} src={source.src} type={source.type} />
          ))}
        </video>
      ) : null}
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
  const t = useTranslations();
  const heroMediaUrl = settings.heroMediaUrl || HERO_DEFAULT_VIDEO_URL;
  const heroMediaType = settings.heroMediaUrl ? settings.heroMediaType : "video";
  const heroPosterUrl = HERO_DEFAULT_POSTER_URL;
  const hasHeroMedia = heroMediaType !== "none" && heroMediaUrl.length > 0;
  const primaryOrderLink = orderLinks[0];

  return (
    <section id="hero" className="hero hero--cinematic">
      <div className="hero-visual">
        <div className="hero-visual-media hero-visual-media--alive">
          {hasHeroMedia ? (
            heroMediaType === "video" ? (
              <HeroVideo src={heroMediaUrl} poster={heroPosterUrl} alt={settings.heroMediaAlt} />
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
      </div>

      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-brand">
            <div className="hero-title hero-chrome-rise hero-chrome-rise--logo">
              <picture>
                <source srcSet={SITE_WORDMARK_WEBP_SRC} type="image/webp" />
                <img
                  className="hero-logo"
                  src={SITE_WORDMARK_SRC}
                  alt=""
                  aria-hidden="true"
                  width={520}
                  height={230}
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
            </div>

            <h1 className="hero-seo-heading">
              {`המבורגר כשר ב${BUSINESS.address.addressLocality}`}
            </h1>

            <p className="hero-local-lede">
              עשוי מחומרי גלם איכותיים ומוכן על הפלנצ׳ה בדיוק כמו שאנחנו אוהבים.
            </p>

            <p className="hero-tagline hero-tagline--below">{t.hero.tagline}</p>
          </div>

          <div className="hero-actions hero-chrome-rise hero-chrome-rise--actions">
            <a className="hero-button hero-button--menu" href="/menu">
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
          </div>
        </div>
      </div>
    </section>
  );
}
