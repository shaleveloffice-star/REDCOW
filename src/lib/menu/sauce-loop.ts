/**
 * Native scrolling and auto-scrolling share one position, so dragging cannot expose an empty track.
 * The track holds the list twice; whenever the auto-scroll passes one full copy it jumps back by exactly
 * that distance, so the row keeps turning in one direction like a carousel.
 * Manual scrolling never wraps: it is clamped to a single copy so the visitor browses each item once.
 */
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
  const cycleWidth = () => {
    const lists = viewport.querySelectorAll<HTMLElement>(".menu-item-sauces-list");
    if (lists.length < 2) return 0;
    const width = lists[1].offsetLeft - lists[0].offsetLeft;
    return width > 0 && viewport.scrollWidth - viewport.clientWidth > width ? width : 0;
  };
  // Keeps the position in [1, width + 1) so there is always room to scroll back without hitting 0.
  const wrap = (value: number) => {
    const width = cycleWidth();
    if (!width) return value;
    if (value >= width + 1) return value - width;
    if (value < 1) return value + width;
    return value;
  };
  // Browsers round scrollLeft, so the sub-pixel position is tracked separately or slow steps would stall.
  const write = (value: number) => {
    viewport.scrollLeft = value;
    position = value;
    expectedScroll = viewport.scrollLeft;
  };
  // Upper scroll bound while the visitor is browsing; null while the auto-scroll is in control.
  let manualMax: number | null = null;
  const track = viewport.querySelector<HTMLElement>(".menu-item-sauces-track");
  const enterManual = () => {
    if (manualMax !== null) return;
    const width = cycleWidth();
    if (!width) return;
    // Both copies look identical, so moving into the first copy is invisible.
    const current = viewport.scrollLeft >= width ? viewport.scrollLeft - width : viewport.scrollLeft;
    write(current);
    manualMax = Math.max(width - viewport.clientWidth, current);
    // Shortening the track lets the browser itself stop at the last item; correcting scrollLeft from
    // scroll events instead fights touch momentum and makes the row stutter.
    if (track) {
      track.style.width = `${manualMax + viewport.clientWidth}px`;
      track.style.overflow = "hidden";
    }
  };
  const exitManual = () => {
    if (manualMax === null) return;
    manualMax = null;
    if (track) {
      track.style.width = "";
      track.style.overflow = "";
    }
  };
  const clampManual = (value: number) => manualMax === null ? value : Math.min(Math.max(value, 0), manualMax);
  const onScroll = () => {
    // Browser-generated scroll events also follow our own writes; only user/momentum changes pause.
    if (Math.abs(viewport.scrollLeft - expectedScroll) > 1) {
      enterManual();
      const clamped = clampManual(viewport.scrollLeft);
      if (clamped !== viewport.scrollLeft) write(clamped);
      else { position = clamped; expectedScroll = clamped; }
      pause();
    }
  };
  const onDown = (event: PointerEvent) => {
    pointerHeld = true;
    dragged = false;
    enterManual();
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
      write(clampManual(mouseStart.scroll - distance));
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
    const canMove = !reducedMotion.matches && !pointerHeld && now >= resumeAt && viewport.dataset.dialogOpen !== "true";
    if (canMove) exitManual();
    if (canMove && cycleWidth() > 0) {
      write(wrap(position + elapsed * (104 / 6000)));
    } else {
      position = viewport.scrollLeft;
    }
    frame = requestAnimationFrame(tick);
  };
  write(wrap(position));
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
    exitManual();
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
