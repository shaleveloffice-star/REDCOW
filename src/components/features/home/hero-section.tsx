"use client";

import type { SiteSettings } from "@/types/content";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import {
  HERO_DEFAULT_POSTER_URL,
  HERO_DEFAULT_VIDEO_URL
} from "@/data/site-images.registry";
import { BUSINESS } from "@/data/business";
import { videoSourcesForMp4 } from "@/lib/video-sources";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

type HeroVideoProps = {
  src: string;
  poster: string;
  alt: string;
};

type HeroSectionProps = {
  settings: SiteSettings;
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

export function HeroSection({ settings }: HeroSectionProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const heroMediaUrl = HERO_DEFAULT_VIDEO_URL;
  const heroPosterUrl = HERO_DEFAULT_POSTER_URL;
  const heroAlt = settings.heroMediaAlt || `חוויה במסעדת ${BUSINESS.name}`;
  const captionDir = locale === "he" ? "rtl" : "ltr";

  return (
    <section id="hero" className="hero hero--cinematic hero--premier" aria-label="NB BURGER">
      <h1 className="sr-only">{`המבורגר כשר ב${BUSINESS.address.addressLocality}`}</h1>
      <div className="hero-visual">
        <div className="hero-visual-media hero-visual-media--alive">
          <HeroVideo src={heroMediaUrl} poster={heroPosterUrl} alt={heroAlt} />
        </div>
        <div className="hero-media-dim" aria-hidden="true" />
      </div>

      <div className="hero-caption">
        <div className="hero-caption-inner" dir={captionDir}>
          <div className="hero-language-switcher" dir="ltr">
            <LanguageSwitcher />
          </div>
          <p className="hero-caption-kicker">{t.hero.captionKicker}</p>
          <p className="hero-caption-title" dir="ltr">
            {t.hero.captionTitle}
          </p>
        </div>
      </div>
    </section>
  );
}
