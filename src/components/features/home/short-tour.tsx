"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const FIRST_STEP_MS = 1500;
const STEP_MS = 6000;

function stepDuration(index: number) {
  return index === 0 ? FIRST_STEP_MS : STEP_MS;
}

const TOUR_STEPS = [
  {
    sectionId: "hero",
    message: "הביס הראשון מתחיל מהמסך."
  },
  {
    sectionId: "menu",
    message: "כאן תכירו את המנות שלנו, מהקלאסיק ועד הקריספי."
  },
  {
    sectionId: "plancha",
    message: "בשר טרי, צריבה חזקה וקראסט שעושה את כל ההבדל."
  },
  {
    sectionId: "atmosphere",
    message: "לא רק המבורגר, מקום לשבת, ליהנות ולהרגיש את הווייב."
  },
  {
    sectionId: "location",
    message: "כאן תמצאו אותנו, ויצמן 1, כפר סבא."
  },
  {
    sectionId: "hero",
    highlightSelector: ".hero-button--order",
    message: "רעבים? עכשיו הזמן להזמין."
  }
] as const;

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type BubblePos = {
  top: number;
  left: number;
};

function getTargetElement(step: (typeof TOUR_STEPS)[number]) {
  if ("highlightSelector" in step && step.highlightSelector) {
    return document.querySelector<HTMLElement>(step.highlightSelector);
  }
  return document.getElementById(step.sectionId);
}

function measureSpotlight(el: HTMLElement): SpotlightRect {
  const rect = el.getBoundingClientRect();
  const pad = 10;
  return {
    top: Math.max(8, rect.top - pad),
    left: Math.max(8, rect.left - pad),
    width: rect.width + pad * 2,
    height: rect.height + pad * 2
  };
}

function measureBubble(spotlight: SpotlightRect): BubblePos {
  const bubbleWidth = Math.min(320, window.innerWidth - 32);
  const centerX = spotlight.left + spotlight.width / 2;
  const left = Math.min(
    Math.max(16, centerX - bubbleWidth / 2),
    window.innerWidth - bubbleWidth - 16
  );

  const bubbleHeightEstimate = 128;
  const spaceBelow = window.innerHeight - (spotlight.top + spotlight.height);
  const top =
    spaceBelow > bubbleHeightEstimate + 24
      ? spotlight.top + spotlight.height + 16
      : Math.max(16, spotlight.top - bubbleHeightEstimate - 12);

  return { top, left };
}

export function ShortTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [bubble, setBubble] = useState<BubblePos | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  }, []);

  const stopTour = useCallback(() => {
    clearTimers();
    setActive(false);
    setStepIndex(0);
    setSpotlight(null);
    setBubble(null);
    document.body.classList.remove("short-tour-active");
  }, [clearTimers]);

  const updateLayout = useCallback((index: number) => {
    const step = TOUR_STEPS[index];
    const target = getTargetElement(step);
    if (!target) return;

    const nextSpotlight = measureSpotlight(target);
    setSpotlight(nextSpotlight);
    setBubble(measureBubble(nextSpotlight));
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      const step = TOUR_STEPS[index];
      const target = getTargetElement(step);
      if (!target) return;

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
        inline: "nearest"
      });

      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(
        () => updateLayout(index),
        reduceMotion ? 0 : 520
      );
    },
    [reduceMotion, updateLayout]
  );

  const startTour = useCallback(() => {
    clearTimers();
    setActive(true);
    setStepIndex(0);
    document.body.classList.add("short-tour-active");
    goToStep(0);
  }, [clearTimers, goToStep]);

  useEffect(() => {
    if (!active) return;

    timerRef.current = setTimeout(() => {
      const next = stepIndex + 1;
      if (next >= TOUR_STEPS.length) {
        stopTour();
        return;
      }
      setStepIndex(next);
      goToStep(next);
    }, stepDuration(stepIndex));

    return clearTimers;
  }, [active, stepIndex, goToStep, stopTour, clearTimers]);

  useLayoutEffect(() => {
    if (!active) return;
    updateLayout(stepIndex);
  }, [active, stepIndex, updateLayout]);

  useEffect(() => {
    if (!active) return;

    const onResize = () => updateLayout(stepIndex);
    const onScroll = () => updateLayout(stepIndex);

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [active, stepIndex, updateLayout]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") stopTour();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, stopTour]);

  useEffect(() => () => {
    clearTimers();
    document.body.classList.remove("short-tour-active");
  }, [clearTimers]);

  const message = TOUR_STEPS[stepIndex]?.message ?? "";

  return (
    <>
      <button
        type="button"
        className="short-tour-trigger"
        onClick={startTour}
        aria-label="התחל סיור קצר באתר"
        disabled={active}
      >
        סיור קצר
      </button>

      {active ? (
        <div className="short-tour-layer" role="dialog" aria-modal="true" aria-label="סיור קצר באתר">
          {spotlight ? (
            <div
              className="short-tour-spotlight"
              style={{
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height
              }}
              aria-hidden="true"
            />
          ) : null}

          {bubble ? (
            <div
              className="short-tour-bubble"
              style={{ top: bubble.top, left: bubble.left }}
              aria-live="polite"
            >
              <p className="short-tour-bubble-text">{message}</p>
              <button type="button" className="short-tour-skip" onClick={stopTour}>
                דלג על הסיור
              </button>
            </div>
          ) : (
            <div className="short-tour-bubble short-tour-bubble--center" aria-live="polite">
              <p className="short-tour-bubble-text">{message}</p>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}
