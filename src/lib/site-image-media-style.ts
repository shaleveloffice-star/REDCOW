import type { CSSProperties } from "react";

import { menuImageMediaStyle } from "@/lib/menu/image-zoom";
import { pickSiteImageFocus } from "@/lib/site-image-focus";
import { pickSiteImageZoom } from "@/lib/site-image-zoom";
import type { SiteImagesMap } from "@/types/site-images";

/** Zoom + desktop/mobile focus from the cached site-images map. */
export function pickSiteImageMediaStyle(
  map: SiteImagesMap | undefined,
  id: string
): CSSProperties | undefined {
  return menuImageMediaStyle({
    zoom: pickSiteImageZoom(map, id),
    focusDesktop: pickSiteImageFocus(map, id, "desktop"),
    focusMobile: pickSiteImageFocus(map, id, "mobile")
  });
}
