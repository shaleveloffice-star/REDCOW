"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { DECORATIVE_IMAGE_ALT } from "@/lib/image-alt";

/** Bump when replacing public/images/hero/nb-burger-hero.webp (avoids stale browser cache). */
const HERO_BURGER_IMAGE_VERSION = "20260803";

/** Single hero asset — used on mobile and desktop (responsive CSS handles layout). */
export const HERO_BURGER_IMAGE = `/images/hero/nb-burger-hero.webp?v=${HERO_BURGER_IMAGE_VERSION}`;

export function HeroSection() {
  const t = useTranslations();
  const { locale } = useLocale();
  const captionDir = locale === "he" ? "rtl" : "ltr";

  return (
    <section id="hero" className="hero hero--cinematic hero--premier hero--solid" aria-label="NB BURGER">
      <h1 className="sr-only">{t.hero.srTitle}</h1>

      <div className="hero-burger" aria-hidden="true">
        <Image
          src={HERO_BURGER_IMAGE}
          alt={DECORATIVE_IMAGE_ALT}
          aria-hidden
          width={2048}
          height={1366}
          priority
          unoptimized
          className="hero-burger-image"
          sizes="(min-width: 768px) min(98vw, 1064px), 98vw"
        />
      </div>

      <div className="hero-caption">
        <div className="hero-caption-inner" dir={captionDir}>
          <p className="hero-caption-kicker">{t.hero.captionKicker}</p>
          <p className="hero-caption-title" dir="ltr">
            {t.hero.captionTitle}
          </p>
        </div>
      </div>
    </section>
  );
}
