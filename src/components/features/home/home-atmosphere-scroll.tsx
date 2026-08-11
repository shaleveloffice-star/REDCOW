"use client";

import { useRef, type CSSProperties } from "react";
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

const OFF_SCREEN_PERCENT = 105;
/** First half of section scroll — image 1 only; transitions begin at 50%. */
const HOLD_UNTIL_PROGRESS = 0.5;

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function BasePanel({ panel }: { panel: HomeAtmospherePanelData }) {
  return (
    <div className="home-atmosphere-scroll-panel" style={{ zIndex: 1 }}>
      <img
        src={panel.src}
        alt={panel.alt}
        className="home-atmosphere-scroll-image"
        draggable={false}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );
}

type AnimatedPanelProps = {
  panel: HomeAtmospherePanelData;
  index: number;
  transitionIndex: number;
  transitionCount: number;
  progress: MotionValue<number>;
};

function segmentBounds(transitionIndex: number, transitionCount: number) {
  const activeRange = 1 - HOLD_UNTIL_PROGRESS;
  const segmentSize = activeRange / transitionCount;
  const segmentStart = HOLD_UNTIL_PROGRESS + transitionIndex * segmentSize;
  const enterEnd = segmentStart + segmentSize * 0.82;
  return { segmentStart, segmentSize, enterEnd };
}

function AnimatedPanel({
  panel,
  index,
  transitionIndex,
  transitionCount,
  progress
}: AnimatedPanelProps) {
  const direction = panel.from === "right" ? 1 : -1;
  const { segmentStart, segmentSize, enterEnd } = segmentBounds(transitionIndex, transitionCount);

  const x = useTransform(progress, (value) => {
    if (value < segmentStart) {
      return `${direction * OFF_SCREEN_PERCENT}%`;
    }
    if (value >= enterEnd) {
      return "0%";
    }
    const t = easeOutCubic((value - segmentStart) / (enterEnd - segmentStart));
    return `${direction * OFF_SCREEN_PERCENT * (1 - t)}%`;
  });

  const opacity = useTransform(progress, (value) => {
    if (value < segmentStart) {
      return 0;
    }
    if (value >= segmentStart + segmentSize * 0.14) {
      return 1;
    }
    return (value - segmentStart) / (segmentSize * 0.14);
  });

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
        loading="lazy"
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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

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
      style={{ "--home-atmosphere-panel-count": panelCount } as CSSProperties}
    >
      <div className="home-atmosphere-scroll-track">
        <div
          className="home-atmosphere-scroll-sticky"
          style={{
            backgroundImage: `url(${panels[0]?.src ?? ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {panels.map((panel, index) =>
            index === 0 ? (
              <BasePanel key={panel.src} panel={panel} />
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
