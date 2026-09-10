"use client";

import { AutoplayVideo } from "@/components/shared/autoplay-video";
import type { CSSProperties } from "react";
import { resolveImageAlt } from "@/lib/image-alt";
import type { MenuHeroConfig } from "@/types/menu-hero";

type MenuHeroProps = {
  config: MenuHeroConfig;
  heroAlt: string;
  locale: "he" | "en" | "fr";
};

export function MenuHero({ config, heroAlt, locale }: MenuHeroProps) {
  if (config.mediaType === "none") return null;

  const alt = resolveImageAlt({ kind: "menu-page-hero", locale, customAlt: config.alt || heroAlt });
  const style = {
    "--menu-hero-desktop-height": `${config.desktopHeight}px`,
    "--menu-hero-mobile-height": `${config.mobileHeight}px`
  } as CSSProperties;

  return (
    <div className="menu-bleecker-hero" style={style}>
      {config.mediaType === "video" ? (
        <AutoplayVideo
          key={config.videoUrl}
          className="menu-bleecker-hero-video"
          src={config.videoUrl}
          poster={config.posterUrl || undefined}
          aria-label={alt}
        />
      ) : (
        <img className="menu-bleecker-hero-image" src={config.imageUrl} alt={alt} fetchPriority="high" />
      )}
    </div>
  );
}
