"use client";

import { AutoplayVideo } from "@/components/shared/autoplay-video";
import {
  HERO_DEFAULT_POSTER_URL,
  HERO_DEFAULT_VIDEO_URL
} from "@/data/site-images.registry";
import { resolveImageAlt } from "@/lib/image-alt";

type MenuHeroProps = {
  heroAlt: string;
  locale: "he" | "en" | "fr";
};

export function MenuHero({ heroAlt, locale }: MenuHeroProps) {
  return (
    <div className="menu-bleecker-hero">
      <AutoplayVideo
        className="menu-bleecker-hero-video"
        src={HERO_DEFAULT_VIDEO_URL}
        poster={HERO_DEFAULT_POSTER_URL}
        aria-label={resolveImageAlt({
          kind: "menu-page-hero",
          locale,
          customAlt: heroAlt
        })}
      />
    </div>
  );
}
