"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useTranslations } from "@/components/providers/locale-provider";
import { dispatchMenuTourScroll } from "@/lib/menu-showcase-tour";

const FIRST_STEP_MS = 1200;
const STEP_MS = 3000;

function stepDuration(index: number) {
  return index === 0 ? FIRST_STEP_MS : STEP_MS;
}

const TOUR_STEP_META = [
  { sectionId: "hero" },
  {
    sectionId: "menu",
    highlightSelector: ".menu-showcase-track",
    animateMenu: true
  },
  { sectionId: "atmosphere" },
  { sectionId: "plancha" },
  { sectionId: "location" },
  {
    sectionId: "hero",
    highlightSelector: ".hero-button--order"
  }
] as const;

type TourStep = (typeof TOUR_STEP_META)[number] & { message: string };

type TimeoutId = ReturnType<typeof setTimeout>;

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
  const t = useTranslations();
  const tourSteps = useMemo<TourStep[]>(
    () =>
      TOUR_STEP_META.map((step, index) => ({
        ...step,
        message: t.shortTour.steps[index] ?? ""
      })),
    [t]
  );

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef<TimeoutId | null>(null);
  const scrollTimerRef = useRef<TimeoutId | null>(null);
  const menuScrollTimersRef = useRef<Array<TimeoutId>>([]);

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

  const updateLayout = useCallback(
    (index: number) => {
      const step = tourSteps[index];
      const target = getTargetElement(step);
      if (!target) return;
      setSpotlightFromElement(target);
    },
    [setSpotlightFromElement, tourSteps]
  );

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
        const timerId = setTimeout(() => {
          dispatchMenuTourScroll({ action, smooth });
          setTimeout(
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
      const step = tourSteps[index];
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
    [reduceMotion, tourSteps, updateLayout, runMenuStepScroll]
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
      if (next >= tourSteps.length) {
        stopTour();
        return;
      }
      setStepIndex(next);
      goToStep(next);
    }, stepDuration(stepIndex));

    return clearTimers;
  }, [active, stepIndex, goToStep, stopTour, clearTimers, tourSteps.length]);

  useLayoutEffect(() => {
    if (!active) return;
    updateLayout(stepIndex);
  }, [active, stepIndex, updateLayout]);

  useEffect(() => {
    if (!active) return;

    const onResize = () => updateLayout(stepIndex);
    const onScroll = () => updateLayout(stepIndex);
    const onMenuTrackScroll = () => {
      if (tourSteps[stepIndex]?.sectionId !== "menu") return;
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
  }, [active, stepIndex, updateLayout, setSpotlightFromElement, tourSteps]);

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

  const message = tourSteps[stepIndex]?.message ?? "";

  return (
    <>
      <button
        type="button"
        className="short-tour-trigger"
        onClick={startTour}
        aria-label={t.shortTour.triggerAria}
        disabled={active}
      >
        {t.shortTour.trigger}
      </button>

      {active ? (
        <div className="short-tour-layer" role="dialog" aria-modal="true" aria-label={t.shortTour.dialogAria}>
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
                {t.shortTour.skip}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
