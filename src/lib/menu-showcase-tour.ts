export const MENU_TOUR_SCROLL_EVENT = "nb-short-tour-menu-scroll";

export type MenuTourScrollDetail = {
  action: "reset" | "goto" | "end";
  index?: number;
  smooth?: boolean;
};

export function dispatchMenuTourScroll(detail: MenuTourScrollDetail) {
  window.dispatchEvent(new CustomEvent<MenuTourScrollDetail>(MENU_TOUR_SCROLL_EVENT, { detail }));
}

function getMaxTrackScroll(track: HTMLElement) {
  return Math.max(0, track.scrollWidth - track.clientWidth);
}

function applyScrollLeft(track: HTMLElement, target: number, smooth: boolean) {
  const behavior: ScrollBehavior = smooth ? "smooth" : "auto";
  track.scrollTo({ left: target, behavior });

  window.setTimeout(() => {
    if (Math.abs(track.scrollLeft - target) > 10) {
      track.scrollLeft = target;
    }
  }, smooth ? 750 : 40);
}

function alignCardInTrack(track: HTMLElement, card: HTMLElement, inset = 24) {
  const trackRect = track.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const delta = cardRect.left - trackRect.left - inset;
  if (Math.abs(delta) > 2) {
    track.scrollLeft += delta;
  }
}

export function scrollMenuTrackToStart(track: HTMLElement, smooth: boolean): boolean {
  applyScrollLeft(track, 0, smooth);
  window.setTimeout(() => {
    track.scrollLeft = 0;
  }, smooth ? 760 : 50);
  return true;
}

export function scrollMenuTrackToEnd(track: HTMLElement, smooth: boolean): boolean {
  const maxScroll = getMaxTrackScroll(track);
  if (maxScroll <= 2) return false;

  const cards = Array.from(track.querySelectorAll<HTMLElement>(".menu-showcase-card"));
  const lastCard = cards[cards.length - 1];

  applyScrollLeft(track, maxScroll, smooth);

  window.setTimeout(() => {
    if (Math.abs(track.scrollLeft - maxScroll) > 12) {
      track.scrollLeft = maxScroll;
    }
    if (Math.abs(track.scrollLeft - maxScroll) > 12) {
      applyScrollLeft(track, -maxScroll, false);
    }
    if (lastCard) {
      alignCardInTrack(track, lastCard, 24);
    }
  }, smooth ? 760 : 50);

  return true;
}

export function scrollMenuTrackToCard(
  track: HTMLElement,
  card: HTMLElement,
  smooth: boolean
): boolean {
  const maxScroll = getMaxTrackScroll(track);
  if (maxScroll <= 2) return false;

  const inset = 24;
  const offsetTarget = Math.max(0, Math.min(maxScroll, card.offsetLeft - inset));
  applyScrollLeft(track, offsetTarget, smooth);

  window.setTimeout(() => {
    alignCardInTrack(track, card, inset);
  }, smooth ? 760 : 50);

  return true;
}

export function scrollMenuTrackToIndex(
  track: HTMLElement,
  index: number,
  smooth: boolean
): boolean {
  const cards = Array.from(track.querySelectorAll<HTMLElement>(".menu-showcase-card"));
  const card = cards[index];
  if (!card) return false;
  return scrollMenuTrackToCard(track, card, smooth);
}
