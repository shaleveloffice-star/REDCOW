"use client";

import { useTranslations } from "@/components/providers/locale-provider";

export function SiteOpeningBanner() {
  const t = useTranslations();

  return (
    <div className="site-opening-banner" role="status" aria-live="polite">
      <p className="site-opening-banner-text">{t.openingBanner.message}</p>
    </div>
  );
}
