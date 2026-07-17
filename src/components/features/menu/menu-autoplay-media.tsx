"use client";

import { AutoplayVideo } from "@/components/shared/autoplay-video";

const MENU_VIDEO_POSTER = "/images/menu/placeholder.svg";

type MenuAutoplayMediaProps = {
  src: string;
  name: string;
};

/** Client island: only menu dish videos need hydration. */
export function MenuAutoplayMedia({ src, name }: MenuAutoplayMediaProps) {
  return <AutoplayVideo src={src} poster={MENU_VIDEO_POSTER} aria-label={name} />;
}
