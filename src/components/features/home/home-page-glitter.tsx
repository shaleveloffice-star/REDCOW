"use client";

import { useEffect, useRef } from "react";

type Sparkle = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  warm: boolean;
};

function createRng(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function buildSparkles(count: number, width: number, height: number): Sparkle[] {
  const rng = createRng(20260910 + count);
  const sparkles: Sparkle[] = [];
  for (let index = 0; index < count; index += 1) {
    sparkles.push({
      x: rng() * width,
      y: rng() * height,
      size: 0.35 + rng() * 1.35,
      phase: rng() * Math.PI * 2,
      speed: 0.8 + rng() * 1.8,
      warm: rng() > 0.55
    });
  }
  return sparkles;
}

/** Dense homepage glitter — canvas so we can render thousands smoothly. */
export function HomePageGlitter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sparkles: Sparkle[] = [];
    let frameId = 0;
    let running = true;
    let width = 0;
    let height = 0;

    const syncSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const nextWidth = Math.max(1, parent.scrollWidth);
      const nextHeight = Math.max(1, parent.scrollHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.floor(nextWidth * dpr);
      canvas.height = Math.floor(nextHeight * dpr);
      canvas.style.width = `${nextWidth}px`;
      canvas.style.height = `${nextHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      // ~50× denser than the previous ~280 DOM sparkles, plus extra fill.
      const count = Math.min(20000, Math.max(14000, Math.round((nextWidth * nextHeight) / 420)));
      sparkles = buildSparkles(count, nextWidth, nextHeight);
    };

    const drawCross = (x: number, y: number, size: number, alpha: number, warm: boolean) => {
      context.save();
      context.globalAlpha = alpha;
      context.strokeStyle = warm ? "rgba(255, 236, 210, 1)" : "rgba(220, 235, 255, 1)";
      context.fillStyle = "#ffffff";
      context.lineWidth = Math.max(0.4, size * 0.35);
      context.beginPath();
      context.moveTo(x, y - size * 1.8);
      context.lineTo(x, y + size * 1.8);
      context.moveTo(x - size * 1.8, y);
      context.lineTo(x + size * 1.8, y);
      context.stroke();
      context.beginPath();
      context.arc(x, y, Math.max(0.35, size * 0.45), 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const paint = (time: number) => {
      if (!running) return;
      context.clearRect(0, 0, width, height);
      const t = time * 0.001;

      for (const sparkle of sparkles) {
        const twinkle = reducedMotion
          ? 0.7
          : 0.25 + (Math.sin(t * sparkle.speed + sparkle.phase) * 0.5 + 0.5) * 0.75;
        drawCross(sparkle.x, sparkle.y, sparkle.size, twinkle, sparkle.warm);
      }

      if (!reducedMotion) {
        frameId = window.requestAnimationFrame(paint);
      }
    };

    syncSize();
    paint(0);
    if (!reducedMotion) {
      frameId = window.requestAnimationFrame(paint);
    }

    const observer = new ResizeObserver(() => {
      syncSize();
      if (reducedMotion) paint(0);
    });
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    return () => {
      running = false;
      observer.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas className="home-page-glitter" aria-hidden="true" ref={canvasRef} />;
}
