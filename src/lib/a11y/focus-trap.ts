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
    return element.getClientRects().length > 0;
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
const inertOwners = new WeakMap<HTMLElement, { count: number; original: boolean }>();
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
      const owner = inertOwners.get(sibling) ?? { count: 0, original: sibling.inert };
      owner.count++;
      inertOwners.set(sibling, owner);
      sibling.inert = true;
      sibling.setAttribute("data-a11y-inert", "");
      marked.push(sibling);
    }

    current = parent;
  }

  return () => {
    for (const element of marked) {
      const owner = inertOwners.get(element);
      if (owner && --owner.count === 0) {
        element.inert = owner.original;
        element.removeAttribute("data-a11y-inert");
        inertOwners.delete(element);
      }
    }
  };
}

/** Traps Tab within `container`. Call the returned function to remove the listener. */
export function trapFocus(container: HTMLElement): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;
    event.stopPropagation();

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
    if (element.isConnected && !element.closest("[inert]")) element.focus();
  });
}

const modalStack: Array<{ root: HTMLElement; dialog: HTMLElement }> = [];
let restoreBackground: (() => void) | undefined;
function syncModalBackground() {
  restoreBackground?.();
  const top = modalStack.at(-1);
  restoreBackground = top ? inertBackground(top.root) : undefined;
}
let originalOverflow = "";
export function mountModal(root: HTMLElement, dialog: HTMLElement, dismiss: () => void, returnTo?: HTMLElement | null): () => void {
  const opener = returnTo ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  if (modalStack.length === 0) originalOverflow = document.body.style.overflow;
  const entry = { root, dialog };
  modalStack.push(entry);
  document.body.style.overflow = "hidden";
  syncModalBackground();
  const release = trapFocus(dialog);
  focusElement(getFocusableElements(dialog)[0] ?? dialog);
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape" && modalStack.at(-1) === entry) {
      event.preventDefault();
      event.stopImmediatePropagation();
      dismiss();
    }
  };
  window.addEventListener("keydown", onKey, true);
  return () => {
    window.removeEventListener("keydown", onKey, true);
    const index = modalStack.indexOf(entry);
    if (index < 0) return;
    modalStack.splice(index, 1);
    release(); syncModalBackground();
    if (modalStack.length === 0) document.body.style.overflow = originalOverflow;
    if (isFocusRestoreTarget(opener)) focusElement(opener);
  };
}
