/** Native scrolling and auto-scrolling share one position, so dragging cannot expose an empty track. */
export function startSauceLoop(viewport: HTMLElement): () => void {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let resumeAt = 0;
  let frame = 0;
  let previousTime = performance.now();
  let position = viewport.scrollLeft;
  let expectedScroll = position;
  let pointerHeld = false;
  let mouseStart: { x: number; scroll: number } | null = null;
  let dragged = false;
  const pause = () => { resumeAt = performance.now() + 3000; };
  const onScroll = () => {
    // Browser-generated scroll events also follow our own writes; only user/momentum changes pause.
    if (Math.abs(viewport.scrollLeft - expectedScroll) > 1) {
      position = viewport.scrollLeft;
      expectedScroll = position;
      pause();
    }
  };
  const onDown = (event: PointerEvent) => {
    pointerHeld = true;
    dragged = false;
    pause();
    if (event.pointerType === "mouse" && event.button === 0) {
      mouseStart = { x: event.clientX, scroll: viewport.scrollLeft };
    }
  };
  const onMove = (event: PointerEvent) => {
    if (!mouseStart) return;
    const distance = event.clientX - mouseStart.x;
    if (Math.abs(distance) > 4) dragged = true;
    if (dragged) {
      event.preventDefault();
      viewport.scrollLeft = mouseStart.scroll - distance;
      pause();
    }
  };
  const onUp = () => {
    if (pointerHeld) pause();
    pointerHeld = false;
    mouseStart = null;
  };
  const onClick = (event: MouseEvent) => {
    if (dragged) { event.preventDefault(); event.stopPropagation(); dragged = false; }
  };
  const tick = (now: number) => {
    const elapsed = Math.min(now - previousTime, 50);
    previousTime = now;
    const group = viewport.querySelector<HTMLElement>(".menu-item-sauces-list");
    const width = group?.getBoundingClientRect().width ?? 0;
    if (!reducedMotion.matches && !pointerHeld && now >= resumeAt && !viewport.querySelector("details[open]") && width > 0) {
      position = (position + elapsed * (104 / 6000)) % width;
      viewport.scrollLeft = position;
      expectedScroll = viewport.scrollLeft;
    } else {
      position = viewport.scrollLeft;
    }
    frame = requestAnimationFrame(tick);
  };
  viewport.addEventListener("scroll", onScroll, { passive: true });
  viewport.addEventListener("wheel", pause, { passive: true });
  viewport.addEventListener("touchmove", pause, { passive: true });
  viewport.addEventListener("keydown", pause);
  viewport.addEventListener("pointerdown", onDown);
  viewport.addEventListener("click", onClick, true);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    viewport.removeEventListener("scroll", onScroll);
    viewport.removeEventListener("wheel", pause);
    viewport.removeEventListener("touchmove", pause);
    viewport.removeEventListener("keydown", pause);
    viewport.removeEventListener("pointerdown", onDown);
    viewport.removeEventListener("click", onClick, true);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  };
}
