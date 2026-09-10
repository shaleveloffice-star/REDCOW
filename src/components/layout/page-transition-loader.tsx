"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MIN_VISIBLE_MS = 450;
const LOADING_MARK_SRC = "/images/brand/nb-loading-mark.png";

function isInternalNavigation(anchor: HTMLAnchorElement, currentUrl: URL): boolean {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.dataset.noTransition === "true") return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  let nextUrl: URL;
  try {
    nextUrl = new URL(anchor.href, currentUrl.origin);
  } catch {
    return false;
  }

  if (nextUrl.origin !== currentUrl.origin) return false;
  if (nextUrl.pathname.startsWith("/admin")) return false;
  if (currentUrl.pathname.startsWith("/admin")) return false;

  return !(nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search);
}

export function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const visibleRef = useRef(false);
  const shownAtRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const clearHideTimers = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
  };

  const showLoader = () => {
    clearHideTimers();
    clearProgressTimer();
    shownAtRef.current = Date.now();
    visibleRef.current = true;
    setVisible(true);
    setProgress(14);
    progressTimerRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 88) return current;
        const step = current < 40 ? 11 : current < 70 ? 6 : 2;
        return Math.min(88, current + step);
      });
    }, 140);
  };

  const hideLoader = () => {
    if (!visibleRef.current) return;
    const elapsed = Date.now() - shownAtRef.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    clearHideTimers();
    hideTimerRef.current = setTimeout(() => {
      setProgress(100);
      clearProgressTimer();
      completeTimerRef.current = setTimeout(() => {
        visibleRef.current = false;
        setVisible(false);
        setProgress(0);
      }, 200);
    }, wait);
  };

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const currentUrl = new URL(window.location.href);
      if (!isInternalNavigation(anchor, currentUrl)) return;
      showLoader();
    };

    document.addEventListener("click", onClickCapture, true);
    return () => {
      document.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  useEffect(() => {
    hideLoader();
  }, [routeKey]);

  useEffect(() => {
    return () => {
      clearHideTimers();
      clearProgressTimer();
    };
  }, []);

  if (pathname.startsWith("/admin") || !visible) {
    return null;
  }

  return (
    <div className="page-transition" role="status" aria-live="polite" aria-busy="true">
      <div className="page-transition-panel">
        <Image
          src={LOADING_MARK_SRC}
          alt=""
          width={160}
          height={139}
          className="page-transition-icon"
          priority
        />
        <div className="page-transition-track" aria-hidden="true">
          <span className="page-transition-bar" style={{ width: `${progress}%` }} />
        </div>
        <span className="sr-only">טוען עמוד…</span>
      </div>
    </div>
  );
}
