export const A11Y_STORAGE_KEY = "nb-a11y";

export type A11yFontScale = 0 | 1 | 2;

export type A11yPreferences = {
  font: A11yFontScale;
  contrast: boolean;
  links: boolean;
  motion: boolean;
};

export const DEFAULT_A11Y_PREFERENCES: A11yPreferences = {
  font: 0,
  contrast: false,
  links: false,
  motion: false
};

export const A11Y_BOOT_SCRIPT = `(function(){try{var r=JSON.parse(localStorage.getItem("${A11Y_STORAGE_KEY}")||"{}");var h=document.documentElement;if(r.font===1||r.font===2)h.setAttribute("data-a11y-font",String(r.font));if(r.contrast)h.setAttribute("data-a11y-contrast","");if(r.links)h.setAttribute("data-a11y-links","");if(r.motion)h.setAttribute("data-a11y-motion","reduce");}catch(e){}})();`;

export function applyA11yPreferences(prefs: A11yPreferences) {
  const html = document.documentElement;

  if (prefs.font === 1 || prefs.font === 2) {
    html.setAttribute("data-a11y-font", String(prefs.font));
  } else {
    html.removeAttribute("data-a11y-font");
  }

  if (prefs.contrast) {
    html.setAttribute("data-a11y-contrast", "");
  } else {
    html.removeAttribute("data-a11y-contrast");
  }

  if (prefs.links) {
    html.setAttribute("data-a11y-links", "");
  } else {
    html.removeAttribute("data-a11y-links");
  }

  if (prefs.motion) {
    html.setAttribute("data-a11y-motion", "reduce");
  } else {
    html.removeAttribute("data-a11y-motion");
  }
}

function isFontScale(value: unknown): value is A11yFontScale {
  return value === 0 || value === 1 || value === 2;
}

export function readA11yPreferences(): A11yPreferences {
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_A11Y_PREFERENCES };
    }

    const parsed = JSON.parse(raw) as Partial<A11yPreferences>;
    return {
      font: isFontScale(parsed.font) ? parsed.font : 0,
      contrast: Boolean(parsed.contrast),
      links: Boolean(parsed.links),
      motion: Boolean(parsed.motion)
    };
  } catch {
    return { ...DEFAULT_A11Y_PREFERENCES };
  }
}

export function saveA11yPreferences(prefs: A11yPreferences) {
  try {
    window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota / private-mode failures */
  }
  applyA11yPreferences(prefs);
}
