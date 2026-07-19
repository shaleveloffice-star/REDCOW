"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

import {
  FRAME_COUNT,
  INGREDIENT_CALLOUTS,
  frameToProgress,
  progressToFrame,
  type IngredientCallout
} from "@/components/features/home/burger-scroll-timeline";

type HudBlockProps = {
  progress: MotionValue<number>;
  inFrames: [number, number];
  outFrames: [number, number];
  className?: string;
  children: ReactNode;
  xFrom?: number;
  yFrom?: number;
  scaleFrom?: number;
  interactive?: boolean;
};

function HudBlock({
  progress,
  inFrames,
  outFrames,
  className,
  children,
  xFrom = 0,
  yFrom = 18,
  scaleFrom = 1,
  interactive = false
}: HudBlockProps) {
  const fadeIn0 = frameToProgress(inFrames[0]);
  const fadeIn1 = frameToProgress(inFrames[1]);
  const fadeOut0 = frameToProgress(outFrames[0]);
  const fadeOut1 = frameToProgress(outFrames[1]);

  const opacity = useTransform(progress, (value) => {
    if (value < fadeIn0) return 0;
    if (value < fadeIn1) return (value - fadeIn0) / Math.max(0.0001, fadeIn1 - fadeIn0);
    if (value < fadeOut0) return 1;
    if (value < fadeOut1) return 1 - (value - fadeOut0) / Math.max(0.0001, fadeOut1 - fadeOut0);
    return 0;
  });

  const x = useTransform(progress, (value) => {
    if (value < fadeIn0) return xFrom;
    if (value < fadeIn1) {
      const t = (value - fadeIn0) / Math.max(0.0001, fadeIn1 - fadeIn0);
      return xFrom * (1 - t);
    }
    return 0;
  });

  const y = useTransform(progress, (value) => {
    if (value < fadeIn0) return yFrom;
    if (value < fadeIn1) {
      const t = (value - fadeIn0) / Math.max(0.0001, fadeIn1 - fadeIn0);
      return yFrom * (1 - t);
    }
    if (value < fadeOut0) return 0;
    if (value < fadeOut1) {
      const t = (value - fadeOut0) / Math.max(0.0001, fadeOut1 - fadeOut0);
      return -10 * t;
    }
    return -10;
  });

  const scale = useTransform(progress, (value) => {
    if (scaleFrom === 1) return 1;
    if (value < fadeIn0) return scaleFrom;
    if (value < fadeIn1) {
      const t = (value - fadeIn0) / Math.max(0.0001, fadeIn1 - fadeIn0);
      return scaleFrom + (1 - scaleFrom) * t;
    }
    return 1;
  });

  const clipPath = useTransform(progress, (value) => {
    if (value < fadeIn0) return "inset(0 100% 0 0)";
    if (value < fadeIn1) {
      const t = (value - fadeIn0) / Math.max(0.0001, fadeIn1 - fadeIn0);
      return `inset(0 ${(1 - t) * 100}% 0 0)`;
    }
    return "inset(0 0% 0 0)";
  });

  const pointerEvents = useTransform(opacity, (value) =>
    interactive && value > 0.45 ? "auto" : "none"
  );

  return (
    <motion.div
      className={className}
      style={{ opacity, x, y, scale, clipPath, pointerEvents }}
    >
      {children}
    </motion.div>
  );
}

function IngredientLabel({
  progress,
  item
}: {
  progress: MotionValue<number>;
  item: IngredientCallout;
}) {
  const appear = frameToProgress(item.appear);
  const solid = frameToProgress(Math.min(item.appear + 8, item.gone - 6));
  const fadeStart = frameToProgress(Math.max(item.gone - 12, item.appear + 10));
  const gone = frameToProgress(item.gone);

  const opacity = useTransform(progress, (value) => {
    if (value < appear) return 0;
    if (value < solid) return (value - appear) / Math.max(0.0001, solid - appear);
    if (value < fadeStart) return 1;
    if (value < gone) return 1 - (value - fadeStart) / Math.max(0.0001, gone - fadeStart);
    return 0;
  });

  const x = useTransform(progress, (value) => {
    const from = item.side === "left" ? -28 : 28;
    if (value < appear) return from;
    if (value < solid) {
      const t = (value - appear) / Math.max(0.0001, solid - appear);
      return from * (1 - t);
    }
    return 0;
  });

  return (
    <motion.div
      className={`burger-hud__callout burger-hud__callout--${item.side}${
        item.mobile ? "" : " burger-hud__callout--desktop-only"
      }`}
      style={{ top: item.top, opacity, x }}
    >
      {item.side === "right" ? (
        <>
          <span className="burger-hud__callout-line" aria-hidden="true" />
          <span className="burger-hud__callout-label">{item.label}</span>
        </>
      ) : (
        <>
          <span className="burger-hud__callout-label">{item.label}</span>
          <span className="burger-hud__callout-line" aria-hidden="true" />
        </>
      )}
    </motion.div>
  );
}

type BurgerScrollHudProps = {
  progress: MotionValue<number>;
  ready: boolean;
};

export function BurgerScrollHud({ progress, ready }: BurgerScrollHudProps) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const scrollRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ready) return;
    return progress.on("change", (value) => {
      const frame = progressToFrame(value);
      const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
      if (frameRef.current) {
        frameRef.current.textContent = String(frame).padStart(3, "0");
      }
      if (scrollRef.current) {
        scrollRef.current.textContent = `${String(pct).padStart(2, "0")}%`;
      }
    });
  }, [progress, ready]);

  return (
    <div className="burger-hud">
      <div className="burger-hud__grid" aria-hidden="true" />
      <div className="burger-hud__vignette" aria-hidden="true" />

      <div className="burger-hud__corners" aria-hidden="true">
        <span className="burger-hud__corner burger-hud__corner--tl" />
        <span className="burger-hud__corner burger-hud__corner--tr" />
        <span className="burger-hud__corner burger-hud__corner--bl" />
        <span className="burger-hud__corner burger-hud__corner--br" />
      </div>

      <div className="burger-hud__edge burger-hud__edge--top" aria-hidden="true">
        <span>NB / 2026</span>
        <span className="burger-hud__rule" />
        <span>
          FRAME <span ref={frameRef}>001</span> / {FRAME_COUNT}
        </span>
      </div>

      <div className="burger-hud__edge burger-hud__edge--bottom" aria-hidden="true">
        <span>CUT 01</span>
        <span className="burger-hud__rule" />
        <span>
          SCROLL <span ref={scrollRef}>00%</span>
        </span>
        <span className="burger-hud__rule burger-hud__rule--short" />
        <span>TEMP / 209°C</span>
      </div>

      <div className="burger-hud__meta-left" aria-hidden="true">
        <span>LAT 32.18</span>
        <span>LON 34.87</span>
        <span>ISO · FOOD-LAB</span>
      </div>

      <div className="burger-hud__meta-right" aria-hidden="true">
        <span>SEQ · BURGER</span>
        <span>PASS · SEAR</span>
        <span>MARK · 01</span>
      </div>

      <HudBlock
        progress={progress}
        inFrames={[1, 8]}
        outFrames={[28, 38]}
        className="burger-hud__intro"
        xFrom={-36}
        yFrom={0}
      >
        <p className="burger-hud__eyebrow">FLAME-PROOF / CUT No. 01</p>
        <div className="burger-hud__stack-title" aria-hidden="true">
          <span className="burger-hud__stack-nb">NB</span>
          <span className="burger-hud__stack-line">/ THE STACK</span>
        </div>
        <h1 className="burger-hud__h1">המבורגר כשר ברעננה</h1>
        <p className="burger-hud__subtitle">SMASHED. SEARED. BUILT DIFFERENT.</p>
      </HudBlock>

      <HudBlock
        progress={progress}
        inFrames={[36, 44]}
        outFrames={[78, 88]}
        className="burger-hud__specs"
        xFrom={40}
        yFrom={12}
        scaleFrom={0.96}
      >
        <p className="burger-hud__specs-kicker">SPECIFICATIONS</p>
        <p className="burger-hud__specs-section">// 02. THE SEAR</p>
        <p className="burger-hud__temp">209°C</p>
        <ul className="burger-hud__spec-list">
          <li>HIGH HEAT</li>
          <li>DOUBLE SMASH</li>
          <li>CRISP EDGES</li>
          <li>JUICY CENTER</li>
        </ul>
        <div className="burger-hud__specs-meta" aria-hidden="true">
          <span>01</span>
          <span>HEAT MAP</span>
          <span>REF 209</span>
        </div>
      </HudBlock>

      <HudBlock
        progress={progress}
        inFrames={[86, 94]}
        outFrames={[118, 128]}
        className="burger-hud__texture"
        yFrom={20}
      >
        <p className="burger-hud__texture-kicker">// SURFACE READ</p>
        <p className="burger-hud__texture-title">CRUST · MAILLARD · FAT CAP</p>
        <div className="burger-hud__texture-marks" aria-hidden="true">
          <span>μ-CRISP</span>
          <span>EDGE 2.4mm</span>
          <span>CORE 58°</span>
        </div>
      </HudBlock>

      <div className="burger-hud__callouts">
        {INGREDIENT_CALLOUTS.map((item) => (
          <IngredientLabel key={item.id} progress={progress} item={item} />
        ))}
      </div>

      <HudBlock
        progress={progress}
        inFrames={[130, 145]}
        outFrames={[195, 210]}
        className="burger-hud__particles"
        yFrom={0}
      >
        <span
          className="burger-hud__particle"
          style={{ ["--x" as string]: "18%", ["--y" as string]: "30%" }}
        />
        <span
          className="burger-hud__particle"
          style={{ ["--x" as string]: "72%", ["--y" as string]: "28%" }}
        />
        <span
          className="burger-hud__particle"
          style={{ ["--x" as string]: "24%", ["--y" as string]: "58%" }}
        />
        <span
          className="burger-hud__particle"
          style={{ ["--x" as string]: "78%", ["--y" as string]: "62%" }}
        />
        <span
          className="burger-hud__particle"
          style={{ ["--x" as string]: "48%", ["--y" as string]: "22%" }}
        />
        <span
          className="burger-hud__particle burger-hud__particle--gold"
          style={{ ["--x" as string]: "62%", ["--y" as string]: "48%" }}
        />
        <span
          className="burger-hud__particle burger-hud__particle--gold"
          style={{ ["--x" as string]: "35%", ["--y" as string]: "42%" }}
        />
      </HudBlock>

      <HudBlock
        progress={progress}
        inFrames={[201, 210]}
        outFrames={[236, 245]}
        className="burger-hud__build"
        yFrom={24}
        interactive
      >
        <p className="burger-hud__build-kicker">// 01. THE BUILD</p>
        <p className="burger-hud__build-line">EVERY LAYER HAS A PURPOSE.</p>
        <a className="hero-button hero-button--order burger-hud__cta" href="/menu">
          לתפריט ולהזמנות
        </a>
      </HudBlock>
    </div>
  );
}
