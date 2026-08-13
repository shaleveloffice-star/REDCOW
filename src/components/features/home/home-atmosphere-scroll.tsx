"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";

import { ResponsiveSiteImage } from "@/components/shared/responsive-site-image";

type PanelSide = "left" | "right";

export type HomeAtmospherePanelData = {
  src: string;
  mobileSrc?: string;
  alt: string;
  from: PanelSide;
};

type HomeAtmosphereScrollProps = {
  panels: HomeAtmospherePanelData[];
  ariaLabel: string;
};

/** Max gentle scale on image 1 during 0–30% (1 → 1 + MAX_HOLD_SCALE). */
const MAX_HOLD_SCALE = 0.022;

/**
 * Animation timeline (0→1), independent from sticky release:
 * 0–30% image 1 | 30–60% image 2 | 60–90% image 3 enters | 90–100% image 3 full
 */
const TRANSITIONS = {
  panel2: { start: 0.3, end: 0.6 },
  panel3: { start: 0.6, end: 0.9 }
} as const;

const TIMELINE = {
  panel1ScaleEnd: TRANSITIONS.panel2.start
} as const;

/** Pinned scroll viewports consumed by the animation timeline (panels 1→2→3). */
const ANIMATION_PIN_VIEWPORTS = 3;
/** Extra pinned scroll after panel 3 is fully on screen — sticky stays until this is scrolled. */
const HOLD_PIN_VIEWPORTS = 1;

function holdPinViewportsForViewport(): number {
  if (typeof window === "undefined") {
    return HOLD_PIN_VIEWPORTS;
  }
  return window.matchMedia("(max-width: 768px)").matches ? 0.85 : HOLD_PIN_VIEWPORTS;
}

function scrollViewportsForViewport(): number {
  return 1 + ANIMATION_PIN_VIEWPORTS + holdPinViewportsForViewport();
}

function animationPinFractionForScrollViewports(scrollViewports: number): number {
  const pinnedScrollViewports = Math.max(1, scrollViewports - 1);
  return ANIMATION_PIN_VIEWPORTS / pinnedScrollViewports;
}

function normalizeLocalProgress(global: number, start: number, end: number): number {
  if (global <= start) {
    return 0;
  }
  if (global >= end) {
    return 1;
  }
  return (global - start) / (end - start);
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge1 <= edge0) {
    return value >= edge1 ? 1 : 0;
  }
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function preloadImages(urls: string[]) {
  [...new Set(urls.filter(Boolean))].forEach((src) => {
    const image = new Image();
    image.src = src;
  });
}

type HoldPanelProps = {
  panel: HomeAtmospherePanelData;
  progress: MotionValue<number>;
};

function HoldPanel({ panel, progress }: HoldPanelProps) {
  const scale = useTransform(progress, (value) => {
    if (value >= TIMELINE.panel1ScaleEnd) {
      return 1;
    }
    const t = smoothstep(0, TIMELINE.panel1ScaleEnd, value);
    return 1 + MAX_HOLD_SCALE * t;
  });

  return (
    <motion.div className="home-atmosphere-scroll-panel" style={{ zIndex: 1, scale }}>
      <ResponsiveSiteImage
        desktopSrc={panel.src}
        mobileSrc={panel.mobileSrc}
        alt={panel.alt}
        className="home-atmosphere-scroll-image"
        pictureClassName="home-atmosphere-scroll-image-frame"
        loading="eager"
        fetchPriority="high"
      />
    </motion.div>
  );
}

type AnimatedPanelProps = {
  panel: HomeAtmospherePanelData;
  index: number;
  progress: MotionValue<number>;
};

function AnimatedPanel({ panel, index, progress }: AnimatedPanelProps) {
  const segment = index === 1 ? TRANSITIONS.panel2 : TRANSITIONS.panel3;
  const fromLeft = panel.from === "left";

  const localT = useTransform(progress, (value) => {
    const local = normalizeLocalProgress(value, segment.start, segment.end);
    return smoothstep(0, 1, local);
  });

  const x = useTransform(localT, (t) => {
    if (fromLeft) {
      return `${-100 + t * 100}%`;
    }
    return `${100 - t * 100}%`;
  });

  const opacity = useTransform(localT, (t) => (t > 0 ? 1 : 0));

  return (
    <motion.div
      className="home-atmosphere-scroll-panel"
      style={{ zIndex: index + 1, x, opacity }}
    >
      <ResponsiveSiteImage
        desktopSrc={panel.src}
        mobileSrc={panel.mobileSrc}
        alt={panel.alt}
        className="home-atmosphere-scroll-image"
        pictureClassName="home-atmosphere-scroll-image-frame"
        loading="eager"
      />
    </motion.div>
  );
}

export function HomeAtmosphereScroll({ panels, ariaLabel }: HomeAtmosphereScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [scrollViewports, setScrollViewports] = useState(1 + ANIMATION_PIN_VIEWPORTS + HOLD_PIN_VIEWPORTS);

  /** A. Section entering viewport — no image transitions during this phase. */
  const { scrollYProgress: entryProgress } = useScroll({
    target: trackRef,
    offset: ["start end", "start start"]
  });

  /** B. Sticky pinned phase — image 1→2→3 timeline runs only here. */
  const { scrollYProgress: pinProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end start"]
  });

  const animationPinFraction = animationPinFractionForScrollViewports(scrollViewports);

  const animationProgress = useTransform([entryProgress, pinProgress], ([entry, pin]) => {
    if ((entry as number) < 1) {
      return 0;
    }
    const pinned = Math.min(1, Math.max(0, pin as number));
    return Math.min(1, pinned / animationPinFraction);
  });

  useEffect(() => {
    preloadImages(
      panels.slice(1).flatMap((panel) => [panel.src, panel.mobileSrc ?? panel.src])
    );
  }, [panels]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const syncViewports = () => setScrollViewports(scrollViewportsForViewport());
    syncViewports();
    mediaQuery.addEventListener("change", syncViewports);
    return () => mediaQuery.removeEventListener("change", syncViewports);
  }, []);

  if (reduceMotion) {
    return (
      <section
        id="atmosphere"
        className="home-atmosphere-section home-atmosphere-section--static"
        aria-label={ariaLabel}
      >
        <div className="home-atmosphere-static-stack">
          {panels.map((panel) => (
            <div key={panel.src} className="home-atmosphere-static-panel">
              <ResponsiveSiteImage
                desktopSrc={panel.src}
                mobileSrc={panel.mobileSrc}
                alt={panel.alt}
                className="home-atmosphere-scroll-image"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="atmosphere"
      className="home-atmosphere-section"
      aria-label={ariaLabel}
      style={{ "--home-atmosphere-scroll-viewports": scrollViewports } as CSSProperties}
    >
      <div ref={trackRef} className="home-atmosphere-scroll-track">
        <div className="home-atmosphere-scroll-sticky">
          {panels.map((panel, index) =>
            index === 0 ? (
              <HoldPanel key={panel.src} panel={panel} progress={animationProgress} />
            ) : (
              <AnimatedPanel key={panel.src} panel={panel} index={index} progress={animationProgress} />
            )
          )}
        </div>
      </div>
    </section>
  );
}
