"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue
} from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const FRAME_COUNT = 121;
const FRAME_LAST_INDEX = FRAME_COUNT - 1;
const READY_FRAME_COUNT = 12;
const MAX_DPR = 2;

function padFrame(n: number) {
  return String(n).padStart(3, "0");
}

function frameSrc(oneBased: number) {
  return `/burger-sequence/burger-${padFrame(oneBased)}.webp`;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function frameIndexFromProgress(progress: number) {
  return Math.min(FRAME_LAST_INDEX, Math.max(0, Math.round(clamp01(progress) * FRAME_LAST_INDEX)));
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  coverScale: number
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih || !cssWidth || !cssHeight) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const scale = Math.max(cssWidth / iw, cssHeight / ih) * coverScale;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cssWidth - dw) / 2;
  const dy = (cssHeight - dh) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, dx, dy, dw, dh);
}

type StageProps = {
  progress: MotionValue<number>;
  fadeIn: [number, number];
  fadeOut: [number, number];
  children: ReactNode;
  className?: string;
};

function ScrollStage({ progress, fadeIn, fadeOut, children, className }: StageProps) {
  const opacity = useTransform(progress, (value) => {
    if (value < fadeIn[0]) return 0;
    if (value < fadeIn[1]) return (value - fadeIn[0]) / (fadeIn[1] - fadeIn[0]);
    if (value < fadeOut[0]) return 1;
    if (value < fadeOut[1]) return 1 - (value - fadeOut[0]) / (fadeOut[1] - fadeOut[0]);
    return 0;
  });

  const y = useTransform(progress, (value) => {
    if (value < fadeIn[0]) return 28;
    if (value < fadeIn[1]) {
      const t = (value - fadeIn[0]) / (fadeIn[1] - fadeIn[0]);
      return 28 * (1 - t);
    }
    if (value < fadeOut[0]) return 0;
    if (value < fadeOut[1]) {
      const t = (value - fadeOut[0]) / (fadeOut[1] - fadeOut[0]);
      return -16 * t;
    }
    return -16;
  });

  const pointerEvents = useTransform(opacity, (value) => (value > 0.45 ? "auto" : "none"));

  return (
    <motion.div className={className} style={{ opacity, y, pointerEvents }}>
      {children}
    </motion.div>
  );
}

function ReducedMotionHero() {
  return (
    <section id="hero" className="burger-scroll-hero burger-scroll-hero--reduced">
      <div className="burger-scroll-hero__sticky">
        <div className="burger-scroll-hero__canvas-wrap" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="burger-scroll-hero__static"
            src={frameSrc(60)}
            alt=""
            width={1920}
            height={1080}
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="burger-scroll-hero__scrim" aria-hidden="true" />
        <div className="burger-scroll-hero__copy burger-scroll-hero__copy--static">
          <p className="burger-scroll-hero__brand">NB BURGER</p>
          <h1 className="burger-scroll-hero__h1">המבורגר כשר ברעננה</h1>
          <p className="burger-scroll-hero__line">טועמים ומבינים.</p>
          <a className="hero-button hero-button--order burger-scroll-hero__cta" href="/menu">
            לתפריט ולהזמנות
          </a>
        </div>
      </div>
    </section>
  );
}

export function BurgerScrollHero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Array<HTMLImageElement | null>>(Array.from({ length: FRAME_COUNT }, () => null));
  const loadedFlagsRef = useRef<boolean[]>(Array.from({ length: FRAME_COUNT }, () => false));
  const frameRef = useRef(0);
  const rafDrawRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1, coverScale: 1.02 });
  const startedRef = useRef(false);

  const [loadPercent, setLoadPercent] = useState(0);
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const scheduleDraw = useCallback(() => {
    if (rafDrawRef.current) return;
    rafDrawRef.current = window.requestAnimationFrame(() => {
      rafDrawRef.current = 0;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let index = frameRef.current;
      let img = imagesRef.current[index];
      if (!img?.complete || !img.naturalWidth) {
        for (let i = index; i >= 0; i -= 1) {
          const candidate = imagesRef.current[i];
          if (candidate?.complete && candidate.naturalWidth) {
            img = candidate;
            index = i;
            break;
          }
        }
      }
      if (!img?.complete || !img.naturalWidth) return;

      const { width, height, dpr, coverScale } = sizeRef.current;
      drawCoverImage(ctx, img, width, height, dpr, coverScale);
    });
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const sticky = canvas?.parentElement;
    if (!canvas || !sticky) return;

    const width = sticky.clientWidth;
    const height = sticky.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const isMobile = width < 768;
    const coverScale = isMobile ? 1.08 : 1.02;

    sizeRef.current = { width, height, dpr, coverScale };
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    scheduleDraw();
  }, [scheduleDraw]);

  useEffect(() => {
    if (reduceMotion) return;

    let cancelled = false;
    let loadedCount = 0;

    const markLoaded = (index: number) => {
      if (cancelled || loadedFlagsRef.current[index]) return;
      loadedFlagsRef.current[index] = true;
      loadedCount += 1;
      setLoadPercent(Math.round((loadedCount / FRAME_COUNT) * 100));

      const earlyReady =
        loadedFlagsRef.current[0] &&
        loadedFlagsRef.current.slice(0, READY_FRAME_COUNT).filter(Boolean).length >= READY_FRAME_COUNT;

      if (earlyReady && !startedRef.current) {
        startedRef.current = true;
        setReady(true);
        scheduleDraw();
      } else if (index === frameRef.current) {
        scheduleDraw();
      }
    };

    for (let i = 0; i < FRAME_COUNT; i += 1) {
      const img = new Image();
      img.decoding = "async";
      imagesRef.current[i] = img;
      img.onload = () => markLoaded(i);
      img.onerror = () => markLoaded(i);
      img.src = frameSrc(i + 1);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeCanvas);
      if (rafDrawRef.current) {
        cancelAnimationFrame(rafDrawRef.current);
        rafDrawRef.current = 0;
      }
      for (let i = 0; i < FRAME_COUNT; i += 1) {
        const img = imagesRef.current[i];
        if (img) {
          img.onload = null;
          img.onerror = null;
          img.src = "";
        }
        imagesRef.current[i] = null;
      }
    };
  }, [reduceMotion, resizeCanvas, scheduleDraw]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduceMotion || !ready) return;
    const next = frameIndexFromProgress(value);
    if (next === frameRef.current) return;
    frameRef.current = next;
    scheduleDraw();
  });

  if (reduceMotion) {
    return <ReducedMotionHero />;
  }

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={`burger-scroll-hero${ready ? " is-ready" : ""}`}
    >
      <div className="burger-scroll-hero__sticky">
        <div className="burger-scroll-hero__canvas-wrap">
          <canvas ref={canvasRef} className="burger-scroll-hero__canvas" aria-hidden="true" />
        </div>

        <div className="burger-scroll-hero__scrim" aria-hidden="true" />

        {!ready ? (
          <div className="burger-scroll-hero__loader" role="status" aria-live="polite">
            <p className="burger-scroll-hero__loader-text">טוענים את ה־NB...</p>
            <p className="burger-scroll-hero__loader-percent">{loadPercent}%</p>
          </div>
        ) : null}

        <div className="burger-scroll-hero__stages">
          <ScrollStage
            progress={scrollYProgress}
            fadeIn={[0, 0.04]}
            fadeOut={[0.16, 0.2]}
            className="burger-scroll-hero__stage burger-scroll-hero__stage--start"
          >
            <p className="burger-scroll-hero__brand">NB BURGER</p>
            <h1 className="burger-scroll-hero__h1">המבורגר כשר ברעננה</h1>
          </ScrollStage>

          <ScrollStage
            progress={scrollYProgress}
            fadeIn={[0.24, 0.3]}
            fadeOut={[0.4, 0.45]}
            className="burger-scroll-hero__stage"
          >
            <p className="burger-scroll-hero__line">לא עוד המבורגר.</p>
            <p className="burger-scroll-hero__line burger-scroll-hero__line--accent">זה NB.</p>
          </ScrollStage>

          <ScrollStage
            progress={scrollYProgress}
            fadeIn={[0.48, 0.54]}
            fadeOut={[0.64, 0.69]}
            className="burger-scroll-hero__stage"
          >
            <p className="burger-scroll-hero__line">בשר. אש. דיוק.</p>
          </ScrollStage>

          <ScrollStage
            progress={scrollYProgress}
            fadeIn={[0.72, 0.78]}
            fadeOut={[0.98, 1.01]}
            className="burger-scroll-hero__stage burger-scroll-hero__stage--final"
          >
            <p className="burger-scroll-hero__line">טועמים ומבינים.</p>
            <a className="hero-button hero-button--order burger-scroll-hero__cta" href="/menu">
              לתפריט ולהזמנות
            </a>
          </ScrollStage>
        </div>
      </div>
    </section>
  );
}
