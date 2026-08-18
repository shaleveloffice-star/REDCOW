const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.hasAttribute("disabled") || element.getAttribute("aria-hidden") === "true") {
      return false;
    }
    if (element.closest("[inert]")) {
      return false;
    }
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    return true;
  });
}

export function isFocusRestoreTarget(element: HTMLElement | null | undefined): element is HTMLElement {
  if (!element || !element.isConnected) {
    return false;
  }
  if (element.hasAttribute("disabled") || element.getAttribute("aria-hidden") === "true") {
    return false;
  }
  if (element.closest("[inert], [aria-hidden='true']")) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || style.pointerEvents === "none") {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width >= 2 && rect.height >= 2;
}

/** Marks sibling branches as inert so AT/keyboard cannot reach content behind a dialog. */
export function inertBackground(keep: HTMLElement): () => void {
  const marked: HTMLElement[] = [];
  let current: HTMLElement | null = keep;

  while (current && current !== document.body) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) {
      break;
    }

    for (const sibling of Array.from(parent.children)) {
      if (sibling === current || !(sibling instanceof HTMLElement)) {
        continue;
      }
      if (sibling.hasAttribute("data-a11y-inert")) {
        continue;
      }
      sibling.inert = true;
      sibling.setAttribute("data-a11y-inert", "");
      marked.push(sibling);
    }

    current = parent;
  }

  return () => {
    for (const element of marked) {
      element.inert = false;
      element.removeAttribute("data-a11y-inert");
    }
  };
}

/** Traps Tab within `container`. Call the returned function to remove the listener. */
export function trapFocus(container: HTMLElement): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first || !container.contains(active)) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last || !container.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener("keydown", onKeyDown);
  return () => container.removeEventListener("keydown", onKeyDown);
}

export function focusElement(element: HTMLElement | null | undefined) {
  if (!element) return;
  window.requestAnimationFrame(() => {
    element.focus();
  });
}
