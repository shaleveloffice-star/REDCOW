"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  HOME_ATMOSPHERE_MARQUEE_COLUMNS,
  HOME_ATMOSPHERE_MARQUEE_HEADLINE,
  HOME_ATMOSPHERE_MARQUEE_VERSION,
  type HomeAtmosphereMarqueeImage
} from "@/data/home-atmosphere-marquee";
import { pickSiteImage } from "@/lib/site-image-url";
import type { SiteImagesMap } from "@/types/site-images";

type HomeAtmosphereMarqueeProps = {
  ariaLabel: string;
  siteImages?: SiteImagesMap;
};

function withVersion(src: string): string {
  const base = src.trim();
  if (!base) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${HOME_ATMOSPHERE_MARQUEE_VERSION}`;
}

function resolveColumnImages(
  column: HomeAtmosphereMarqueeImage[],
  siteImages?: SiteImagesMap
): HomeAtmosphereMarqueeImage[] {
  return column.map((item) => {
    const resolved = item.siteImageId
      ? pickSiteImage(siteImages, item.siteImageId, item.src)
      : item.src;
    return {
      ...item,
      src: withVersion(resolved)
    };
  });
}

function MarqueeColumn({
  images,
  direction,
  durationSec
}: {
  images: HomeAtmosphereMarqueeImage[];
  direction: "up" | "down";
  durationSec: number;
}) {
  const loop = [...images, ...images];

  return (
    <div
      className={`home-atmosphere-marquee-col home-atmosphere-marquee-col--${direction}`}
      style={{ "--home-atmosphere-marquee-duration": `${durationSec}s` } as CSSProperties}
      aria-hidden="true"
    >
      <div className="home-atmosphere-marquee-track">
        {loop.map((image, index) => (
          <div key={`${image.src}-${index}`} className="home-atmosphere-marquee-cell">
            <img
              src={image.src}
              alt=""
              className="home-atmosphere-marquee-image"
              width={640}
              height={800}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeAtmosphereMarquee({ ariaLabel, siteImages }: HomeAtmosphereMarqueeProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const columns = HOME_ATMOSPHERE_MARQUEE_COLUMNS.map((column) =>
    resolveColumnImages(column, siteImages)
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setInView(entry.isIntersecting);
      },
      { rootMargin: "120px 0px", threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      id="atmosphere"
      className={`home-atmosphere-marquee${inView ? " is-inview" : ""}`}
      aria-label={ariaLabel}
    >
      <div className="home-atmosphere-marquee-columns" aria-hidden="true">
        <MarqueeColumn images={columns[0] ?? []} direction="up" durationSec={42} />
        <MarqueeColumn images={columns[1] ?? []} direction="down" durationSec={48} />
        <MarqueeColumn images={columns[2] ?? []} direction="up" durationSec={38} />
      </div>

      <div className="home-atmosphere-marquee-overlay" aria-hidden="true" />

      <h2 className="home-atmosphere-marquee-title" dir="ltr" lang="en">
        <span className="home-atmosphere-marquee-title-line">
          {HOME_ATMOSPHERE_MARQUEE_HEADLINE.line1}
        </span>
        <span className="home-atmosphere-marquee-title-line">
          {HOME_ATMOSPHERE_MARQUEE_HEADLINE.line2}
        </span>
        <span className="home-atmosphere-marquee-title-line">
          {HOME_ATMOSPHERE_MARQUEE_HEADLINE.line3}
        </span>
      </h2>
    </section>
  );
}
