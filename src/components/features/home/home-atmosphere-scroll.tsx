"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";

type PanelSide = "left" | "right";

export type HomeAtmospherePanelData = {
  src: string;
  alt: string;
  from: PanelSide;
};

type HomeAtmosphereScrollProps = {
  panels: HomeAtmospherePanelData[];
  ariaLabel: string;
};

/** Subtle slide — most of the transition is crossfade to avoid harsh cuts. */
const SLIDE_PERCENT = 28;
/** Hold image 1, then transitions use the rest of scroll progress. */
const HOLD_UNTIL_PROGRESS = 0.28;
/** Max gentle scale during hold (1 → 1 + MAX_HOLD_SCALE). */
const MAX_HOLD_SCALE = 0.022;

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge1 <= edge0) {
    return value >= edge1 ? 1 : 0;
  }
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function segmentBounds(transitionIndex: number, transitionCount: number) {
  const activeRange = 1 - HOLD_UNTIL_PROGRESS;
  const segmentSize = activeRange / transitionCount;
  const segmentStart = HOLD_UNTIL_PROGRESS + transitionIndex * segmentSize;
  const segmentEnd = segmentStart + segmentSize;
  const fadeStart = segmentStart - segmentSize * 0.06;
  const fadeEnd = segmentStart + segmentSize * 0.55;
  return { segmentStart, segmentEnd, fadeStart, fadeEnd };
}

function scrollViewportsForViewport(): number {
  if (typeof window === "undefined") {
    return 2.35;
  }
  return window.matchMedia("(max-width: 768px)").matches ? 2.05 : 2.35;
}

function preloadImages(urls: string[]) {
  urls.forEach((src) => {
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
    if (value >= HOLD_UNTIL_PROGRESS) {
      return 1;
    }
    const t = smoothstep(0, HOLD_UNTIL_PROGRESS, value);
    return 1 + MAX_HOLD_SCALE * t;
  });

  return (
    <motion.div className="home-atmosphere-scroll-panel" style={{ zIndex: 1, scale }}>
      <img
        src={panel.src}
        alt={panel.alt}
        className="home-atmosphere-scroll-image"
        draggable={false}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
    </motion.div>
  );
}

type AnimatedPanelProps = {
  panel: HomeAtmospherePanelData;
  index: number;
  transitionIndex: number;
  transitionCount: number;
  progress: MotionValue<number>;
};

function AnimatedPanel({
  panel,
  index,
  transitionIndex,
  transitionCount,
  progress
}: AnimatedPanelProps) {
  const direction = panel.from === "right" ? 1 : -1;
  const { segmentEnd, fadeStart, fadeEnd } = segmentBounds(transitionIndex, transitionCount);

  const x = useTransform(progress, (value) => {
    const t = smoothstep(fadeStart, segmentEnd, value);
    return `${direction * SLIDE_PERCENT * (1 - t)}%`;
  });

  const opacity = useTransform(progress, (value) => smoothstep(fadeStart, fadeEnd, value));

  return (
    <motion.div
      className="home-atmosphere-scroll-panel"
      style={{ zIndex: index + 1, x, opacity }}
    >
      <img
        src={panel.src}
        alt={panel.alt}
        className="home-atmosphere-scroll-image"
        draggable={false}
        loading="eager"
        decoding="async"
      />
    </motion.div>
  );
}

export function HomeAtmosphereScroll({ panels, ariaLabel }: HomeAtmosphereScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const panelCount = panels.length;
  const transitionCount = Math.max(panelCount - 1, 1);
  const [scrollViewports, setScrollViewports] = useState(2.35);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  useEffect(() => {
    preloadImages(panels.slice(1).map((panel) => panel.src));
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
              <img
                src={panel.src}
                alt={panel.alt}
                className="home-atmosphere-scroll-image"
                loading="lazy"
                decoding="async"
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
      ref={sectionRef}
      className="home-atmosphere-section"
      aria-label={ariaLabel}
      style={{ "--home-atmosphere-scroll-viewports": scrollViewports } as CSSProperties}
    >
      <div className="home-atmosphere-scroll-track">
        <div className="home-atmosphere-scroll-sticky">
          {panels.map((panel, index) =>
            index === 0 ? (
              <HoldPanel key={panel.src} panel={panel} progress={scrollYProgress} />
            ) : (
              <AnimatedPanel
                key={panel.src}
                panel={panel}
                index={index}
                transitionIndex={index - 1}
                transitionCount={transitionCount}
                progress={scrollYProgress}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
