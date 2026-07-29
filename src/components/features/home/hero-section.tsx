"use client";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { BUSINESS } from "@/data/business";

export function HeroSection() {
  const t = useTranslations();
  const { locale } = useLocale();
  const captionDir = locale === "he" ? "rtl" : "ltr";

  return (
    <section id="hero" className="hero hero--cinematic hero--premier hero--solid" aria-label="NB BURGER">
      <h1 className="sr-only">{`המבורגר כשר ב${BUSINESS.address.addressLocality}`}</h1>

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
