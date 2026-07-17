"use client";

import { useEffect, useRef, useState } from "react";

import { BurgerAssemblyStage } from "@/components/features/home/burger-assembly-section";

/**
 * Defers mounting burger layer <img>s until near the viewport so the initial
 * HTML does not preload six large PNGs above-the-fold.
 */
export function LazyBurgerAssemblyStage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || active) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px", threshold: 0.01 }
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div ref={hostRef} className="burger-assembly-lazy-host">
      {active ? (
        <BurgerAssemblyStage />
      ) : (
        <div className="burger-assembly__stage burger-assembly__stage--placeholder" aria-hidden="true" />
      )}
    </div>
  );
}
