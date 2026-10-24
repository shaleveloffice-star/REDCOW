"use client";

import Image from "next/image";

import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { ResponsiveSiteImage } from "@/components/shared/responsive-site-image";
import { SiteImageOverlay } from "@/components/shared/site-image-overlay";
import type { SiteImageOverlay as SiteImageOverlayValue } from "@/lib/site-image-overlay";
import { AutoplayVideo } from "@/components/shared/autoplay-video";
import { isVideoMediaUrl } from "@/lib/menu-media";
import { canOptimizeSiteImage } from "@/lib/site-image-url";
import { HOME_HERO_IMAGE } from "@/data/site-images.registry";
import { HERO_IMAGE_VERSION } from "@/data/site-image-versions";
import { DECORATIVE_IMAGE_ALT } from "@/lib/image-alt";
import { menuImageMediaStyle } from "@/lib/menu/image-zoom";
import type { SiteImageFocus } from "@/lib/site-image-focus";

/** Single hero asset — used on mobile and desktop (responsive CSS handles layout). */
export const HERO_BURGER_IMAGE = `${HOME_HERO_IMAGE}?v=${HERO_IMAGE_VERSION}`;

/** Full-bleed: the image covers the whole hero section. */
const HERO_IMAGE_SIZES = "100vw";

type HeroSectionProps = {
  heroImageUrl?: string;
  heroMobileImageUrl?: string;
  heroOverlay?: SiteImageOverlayValue | null;
  heroZoom?: number;
  videoStart?: number;
  videoEnd?: number | null;
  heroFocusDesktop?: SiteImageFocus;
  heroFocusMobile?: SiteImageFocus;
};

export function HeroSection({
  heroImageUrl,
  heroMobileImageUrl,
  heroOverlay,
  heroZoom,
  videoStart,
  videoEnd,
  heroFocusDesktop,
  heroFocusMobile
}: HeroSectionProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const captionDir = locale === "he" ? "rtl" : "ltr";
  const imageSrc = heroImageUrl === undefined ? HERO_BURGER_IMAGE : heroImageUrl.trim();
  const mobileSrc = heroMobileImageUrl?.trim() || imageSrc;
  const isVideo = isVideoMediaUrl(imageSrc);
  const useOptimizedImage = mobileSrc === imageSrc && canOptimizeSiteImage(imageSrc);
  const mediaStyle = menuImageMediaStyle({
    zoom: heroZoom,
    focusDesktop: heroFocusDesktop,
    focusMobile: heroFocusMobile
  });

  return (
    <section id="hero" className="hero hero--cinematic hero--premier hero--solid" aria-label="SO WHAT?">
      <div className={`hero-burger${isVideo ? " hero-burger--video" : ""}`}>
        {!imageSrc ? null : isVideo ? (
          <AutoplayVideo
            src={imageSrc}
            videoStart={videoStart}
            videoEnd={videoEnd}
            className="hero-burger-image site-media-focus"
            style={mediaStyle}
            preload="metadata"
          />
        ) : useOptimizedImage ? (
          <Image
            src={imageSrc}
            alt={DECORATIVE_IMAGE_ALT}
            width={2048}
            height={1366}
            sizes={HERO_IMAGE_SIZES}
            preload
            fetchPriority="high"
            draggable={false}
            className="hero-burger-image site-media-focus"
            style={mediaStyle}
          />
        ) : (
          <ResponsiveSiteImage
            desktopSrc={imageSrc}
            mobileSrc={mobileSrc}
            alt={DECORATIVE_IMAGE_ALT}
            width={2048}
            height={1366}
            loading="eager"
            fetchPriority="high"
            className="hero-burger-image site-media-focus"
            style={mediaStyle}
          />
        )}
        {imageSrc ? <SiteImageOverlay overlay={heroOverlay} /> : null}
      </div>

      <div className="hero-caption">
        <div className="hero-caption-inner" dir={captionDir}>
          <p className="hero-caption-kicker">{t.hero.captionKicker}</p>
          <p className="hero-caption-title" dir="ltr">
            {t.hero.captionTitle}
          </p>
          <h1 className="hero-location-heading">{t.hero.srTitle}</h1>
        </div>
      </div>
    </section>
  );
}
