"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { dispatchMenuTourScroll } from "@/lib/menu-showcase-tour";

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
    highlightSelector: ".menu-showcase-track",
    animateMenu: true,
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

type TourStep = (typeof TOUR_STEPS)[number];

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function getTargetElement(step: TourStep) {
  if ("highlightSelector" in step && step.highlightSelector) {
    return document.querySelector<HTMLElement>(step.highlightSelector);
  }
  return document.getElementById(step.sectionId);
}

function applySpotlight(el: HTMLElement): SpotlightRect {
  const rect = el.getBoundingClientRect();
  const pad = 10;
  return {
    top: Math.max(8, rect.top - pad),
    left: Math.max(8, rect.left - pad),
    width: rect.width + pad * 2,
    height: rect.height + pad * 2
  };
}

export function ShortTour() {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuScrollTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const clearMenuScrollTimers = useCallback(() => {
    menuScrollTimersRef.current.forEach((id) => clearTimeout(id));
    menuScrollTimersRef.current = [];
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
    clearMenuScrollTimers();
  }, [clearMenuScrollTimers]);

  const stopTour = useCallback(() => {
    clearTimers();
    setActive(false);
    setStepIndex(0);
    setSpotlight(null);
    document.body.classList.remove("short-tour-active");
  }, [clearTimers]);

  const setSpotlightFromElement = useCallback((el: HTMLElement) => {
    setSpotlight(applySpotlight(el));
  }, []);

  const updateLayout = useCallback((index: number) => {
    const step = TOUR_STEPS[index];
    const target = getTargetElement(step);
    if (!target) return;
    setSpotlightFromElement(target);
  }, [setSpotlightFromElement]);

  const runMenuStepScroll = useCallback(
    (reduceMotionEnabled: boolean) => {
      const track = document.querySelector<HTMLElement>(".menu-showcase-track");
      if (!track) return;

      clearMenuScrollTimers();
      dispatchMenuTourScroll({ action: "reset" });
      setSpotlightFromElement(track);

      const cardCount = track.querySelectorAll(".menu-showcase-card").length;
      if (cardCount <= 1) return;

      const smooth = !reduceMotionEnabled;
      const startDelayMs = reduceMotionEnabled ? 0 : 800;

      const scrollSequence: Array<{ delay: number; action: "end" | "reset" }> = [
        { delay: startDelayMs, action: "end" },
        { delay: startDelayMs + 1800, action: "reset" },
        { delay: startDelayMs + 3600, action: "end" },
        { delay: startDelayMs + 5000, action: "reset" }
      ];

      scrollSequence.forEach(({ delay, action }) => {
        const timerId = window.setTimeout(() => {
          dispatchMenuTourScroll({ action, smooth });
          window.setTimeout(
            () => setSpotlightFromElement(track),
            reduceMotionEnabled ? 0 : 520
          );
        }, delay);

        menuScrollTimersRef.current.push(timerId);
      });
    },
    [clearMenuScrollTimers, setSpotlightFromElement]
  );

  const goToStep = useCallback(
    (index: number) => {
      const step = TOUR_STEPS[index];
      const target = getTargetElement(step);
      const section = document.getElementById(step.sectionId);
      if (!target && !section) return;

      (section ?? target)!.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
        inline: "nearest"
      });

      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(
        () => {
          updateLayout(index);
          if ("animateMenu" in step && step.animateMenu) {
            requestAnimationFrame(() => {
              runMenuStepScroll(reduceMotion);
            });
          }
        },
        reduceMotion ? 0 : 680
      );
    },
    [reduceMotion, updateLayout, runMenuStepScroll]
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
    const onMenuTrackScroll = () => {
      if (TOUR_STEPS[stepIndex]?.sectionId !== "menu") return;
      const track = document.querySelector<HTMLElement>(".menu-showcase-track");
      if (track) setSpotlightFromElement(track);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    const menuTrack = document.querySelector<HTMLElement>(".menu-showcase-track");
    menuTrack?.addEventListener("scroll", onMenuTrackScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      menuTrack?.removeEventListener("scroll", onMenuTrackScroll);
    };
  }, [active, stepIndex, updateLayout, setSpotlightFromElement]);

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

          <div className="short-tour-caption" aria-live="polite">
            <div className="short-tour-caption-panel" key={stepIndex}>
              <p className="short-tour-caption-text">{message}</p>
              <button type="button" className="short-tour-skip" onClick={stopTour}>
                דלג על הסיור
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
