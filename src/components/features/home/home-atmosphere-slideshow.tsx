"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 3000;

type HomeAtmosphereSlideshowProps = {
  slides: string[];
};

export function HomeAtmosphereSlideshow({ slides }: HomeAtmosphereSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => setReducedMotion(mediaQuery.matches);

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);
    return () => mediaQuery.removeEventListener("change", syncReducedMotion);
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || reducedMotion) return;

    const timerId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [slides.length, reducedMotion]);

  if (slides.length === 0) return null;

  return (
    <div className="home-atmosphere-slideshow" aria-hidden="true">
      {slides.map((src, index) => (
        <div
          key={src}
          className={`home-atmosphere-slide${index === activeIndex ? " is-active" : ""}`}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="100vw"
            className="home-atmosphere-image"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
