"use client";

import { useLayoutEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

function readA11yReduceMotion(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return document.documentElement.getAttribute("data-a11y-motion") === "reduce";
}

/** OS prefers-reduced-motion plus the site accessibility widget setting. */
export function useEffectiveReducedMotion(): boolean {
  const osReduce = useReducedMotion();
  const [a11yReduce, setA11yReduce] = useState(readA11yReduceMotion);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const sync = () => setA11yReduce(html.getAttribute("data-a11y-motion") === "reduce");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["data-a11y-motion"] });
    return () => observer.disconnect();
  }, []);

  return Boolean(osReduce) || a11yReduce;
}
