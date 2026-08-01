"use client";

import { AutoplayVideo } from "@/components/shared/autoplay-video";

const MENU_VIDEO_POSTER = "/images/menu/nb-menu-burger.png";

type MenuAutoplayMediaProps = {
  src: string;
  name: string;
  /** When true, video is hidden from AT (redundant with adjacent link text). */
  decorative?: boolean;
};

/** Client island: only menu dish videos need hydration. */
export function MenuAutoplayMedia({ src, name, decorative = false }: MenuAutoplayMediaProps) {
  if (decorative) {
    return <AutoplayVideo src={src} poster={MENU_VIDEO_POSTER} aria-hidden />;
  }

  return <AutoplayVideo src={src} poster={MENU_VIDEO_POSTER} aria-label={name} />;
}
