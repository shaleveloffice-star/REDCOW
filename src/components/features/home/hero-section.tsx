"use client";

import Image from "next/image";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { BUSINESS } from "@/data/business";

const HERO_BURGER_IMAGE = "/images/hero/nb-burger-hero-current.webp";

export function HeroSection() {
  const t = useTranslations();
  const { locale } = useLocale();
  const captionDir = locale === "he" ? "rtl" : "ltr";

  return (
    <section id="hero" className="hero hero--cinematic hero--premier hero--solid" aria-label="NB BURGER">
      <h1 className="sr-only">{`המבורגר כשר ב${BUSINESS.address.addressLocality}`}</h1>

      <div className="hero-burger" aria-hidden="true">
        <Image
          src={HERO_BURGER_IMAGE}
          alt=""
          width={1024}
          height={682}
          priority
          unoptimized
          className="hero-burger-image"
          sizes="(max-width: 768px) 98vw, min(98vw, 1064px)"
        />
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
