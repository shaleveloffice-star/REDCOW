"use client";

import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { BurgerScrollHud } from "@/components/features/home/BurgerScrollHud";
import {
  FRAME_COUNT,
  FRAME_LAST_INDEX
} from "@/components/features/home/burger-scroll-timeline";

const READY_FRAME_COUNT = 18;
const MAX_DPR = 2;
const CANVAS_BG = "#050505";

function padFrame(n: number) {
  return String(n).padStart(3, "0");
}

export function burgerFrameSrc(oneBased: number) {
  return `/burger-sequence/burger-${padFrame(oneBased)}.webp`;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function frameIndexFromProgress(progress: number) {
  return Math.min(
    FRAME_LAST_INDEX,
    Math.max(0, Math.round(clamp01(progress) * FRAME_LAST_INDEX))
  );
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
  ctx.fillStyle = CANVAS_BG;
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

function findNearestLoadedFrame(
  images: Array<HTMLImageElement | null>,
  loaded: boolean[],
  preferred: number
): { index: number; img: HTMLImageElement } | null {
  const preferredImg = images[preferred];
  if (loaded[preferred] && preferredImg?.complete && preferredImg.naturalWidth) {
    return { index: preferred, img: preferredImg };
  }

  for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
    const before = preferred - distance;
    const after = preferred + distance;

    if (before >= 0) {
      const img = images[before];
      if (loaded[before] && img?.complete && img.naturalWidth) {
        return { index: before, img };
      }
    }

    if (after < FRAME_COUNT) {
      const img = images[after];
      if (loaded[after] && img?.complete && img.naturalWidth) {
        return { index: after, img };
      }
    }
  }

  return null;
}

function ReducedMotionHero() {
  return (
    <section id="hero" className="burger-scroll-hero burger-scroll-hero--reduced">
      <div className="burger-scroll-hero__sticky">
        <div className="burger-scroll-hero__canvas-wrap" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="burger-scroll-hero__static"
            src={burgerFrameSrc(FRAME_COUNT)}
            alt=""
            width={1920}
            height={1080}
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="burger-scroll-hero__scrim" aria-hidden="true" />
        <div className="burger-hud burger-hud--static">
          <div className="burger-hud__intro burger-hud__intro--static">
            <p className="burger-hud__eyebrow">FLAME-PROOF / CUT No. 01</p>
            <div className="burger-hud__stack-title" aria-hidden="true">
              <span className="burger-hud__stack-nb">NB</span>
              <span className="burger-hud__stack-line">/ THE STACK</span>
            </div>
            <h1 className="burger-hud__h1">המבורגר כשר ברעננה</h1>
            <p className="burger-hud__subtitle">SMASHED. SEARED. BUILT DIFFERENT.</p>
            <p className="burger-hud__temp burger-hud__temp--inline">209°C</p>
            <a className="hero-button hero-button--order burger-hud__cta" href="/menu">
              לתפריט ולהזמנות
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BurgerScrollHero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Array<HTMLImageElement | null>>(
    Array.from({ length: FRAME_COUNT }, () => null)
  );
  const loadedFlagsRef = useRef<boolean[]>(Array.from({ length: FRAME_COUNT }, () => false));
  const frameRef = useRef(0);
  const lastDrawnRef = useRef(-1);
  const rafDrawRef = useRef(0);
  const percentRafRef = useRef(0);
  const loadedCountRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1, coverScale: 1.02 });
  const readyRef = useRef(false);

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

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const nearest = findNearestLoadedFrame(
        imagesRef.current,
        loadedFlagsRef.current,
        frameRef.current
      );
      if (!nearest) return;

      if (nearest.index === lastDrawnRef.current) return;
      lastDrawnRef.current = nearest.index;

      const { width, height, dpr, coverScale } = sizeRef.current;
      drawCoverImage(ctx, nearest.img, width, height, dpr, coverScale);
    });
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = canvas?.parentElement;
    if (!canvas || !wrap) return;

    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const isMobile = width < 768;
    const coverScale = isMobile ? 1.06 : 1.02;

    sizeRef.current = { width, height, dpr, coverScale };

    const nextW = Math.max(1, Math.round(width * dpr));
    const nextH = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
      lastDrawnRef.current = -1;
    }

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    scheduleDraw();
  }, [scheduleDraw]);

  useEffect(() => {
    if (reduceMotion) return;

    let cancelled = false;

    const bumpPercent = () => {
      if (percentRafRef.current) return;
      percentRafRef.current = window.requestAnimationFrame(() => {
        percentRafRef.current = 0;
        if (cancelled) return;
        setLoadPercent(Math.round((loadedCountRef.current / FRAME_COUNT) * 100));
      });
    };

    const markLoaded = (index: number) => {
      if (cancelled || loadedFlagsRef.current[index]) return;
      loadedFlagsRef.current[index] = true;
      loadedCountRef.current += 1;
      bumpPercent();

      const earlyReady =
        loadedFlagsRef.current[0] &&
        loadedFlagsRef.current.slice(0, READY_FRAME_COUNT).every(Boolean);

      if (earlyReady && !readyRef.current) {
        readyRef.current = true;
        setReady(true);
        lastDrawnRef.current = -1;
        scheduleDraw();
      } else if (index === frameRef.current || Math.abs(index - frameRef.current) <= 2) {
        lastDrawnRef.current = -1;
        scheduleDraw();
      }
    };

    const loadAt = (index: number) => {
      if (imagesRef.current[index]) return;
      const img = new Image();
      img.decoding = "async";
      imagesRef.current[index] = img;
      img.onload = () => markLoaded(index);
      img.onerror = () => markLoaded(index);
      img.src = burgerFrameSrc(index + 1);
    };

    for (let i = 0; i < READY_FRAME_COUNT; i += 1) {
      loadAt(i);
    }

    const idleLoad = () => {
      if (cancelled) return;
      for (let i = READY_FRAME_COUNT; i < FRAME_COUNT; i += 1) {
        loadAt(i);
      }
    };

    let idleId: number | undefined;
    let timeoutId: number | undefined;

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(idleLoad, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(idleLoad, 120);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeCanvas);
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      if (rafDrawRef.current) {
        cancelAnimationFrame(rafDrawRef.current);
        rafDrawRef.current = 0;
      }
      if (percentRafRef.current) {
        cancelAnimationFrame(percentRafRef.current);
        percentRafRef.current = 0;
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
    if (reduceMotion || !readyRef.current) return;
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
          <canvas
            ref={canvasRef}
            className="burger-scroll-hero__canvas"
            aria-hidden="true"
          />
        </div>

        <div className="burger-scroll-hero__scrim" aria-hidden="true" />

        {!ready ? (
          <div className="burger-scroll-hero__loader" role="status" aria-live="polite">
            <p className="burger-scroll-hero__loader-text">Loading...</p>
            <p className="burger-scroll-hero__loader-percent">{loadPercent}%</p>
          </div>
        ) : null}

        <BurgerScrollHud progress={scrollYProgress} ready={ready} />
      </div>
    </section>
  );
}
