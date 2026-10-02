"use client";

import { useEffect } from "react";

import { getMenuCardMediaUrl } from "@/components/features/menu/menu-items-grid";
import { shouldUsePlainImg } from "@/components/shared/menu-item-image";
import { isVideoMediaUrl } from "@/lib/menu-media";
import type { MenuCategory, MenuItem } from "@/types/content";

/** Only the top row of the neighbouring categories - never the whole menu. */
const IMAGES_PER_ADJACENT_CATEGORY = 2;

/** URLs already requested this session, so revisits never queue the same prefetch twice. */
const prefetchedUrls = new Set<string>();

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };

function connectionAllowsPrefetch(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!connection) return true;
  if (connection.saveData) return false;
  return !connection.effectiveType || connection.effectiveType === "4g";
}

function adjacentCategoryImageUrls(groups: Array<MenuCategory & { items: MenuItem[] }>, currentId: string): string[] {
  const withItems = groups.filter((group) => group.items.length > 0);
  const index = withItems.findIndex((group) => group.id === currentId);
  if (index === -1) return [];

  const neighbours = [withItems[index + 1], withItems[index - 1]].filter(Boolean);
  return neighbours.flatMap((group) =>
    group.items
      .map(getMenuCardMediaUrl)
      // Plain <img> URLs are requested verbatim by the card, so a warmed cache entry is a guaranteed hit.
      .filter((url) => !isVideoMediaUrl(url) && shouldUsePlainImg(url))
      .slice(0, IMAGES_PER_ADJACENT_CATEGORY)
  );
}

/**
 * After the current category has fully loaded and the browser is idle, warms the HTTP cache with the
 * first images of the previous/next categories. Skipped on Save-Data and slower-than-4G connections.
 */
export function useAdjacentCategoryImagePrefetch(
  groups: Array<MenuCategory & { items: MenuItem[] }>,
  currentId: string
) {
  const urls = adjacentCategoryImageUrls(groups, currentId);
  const urlsKey = urls.join("\n");

  useEffect(() => {
    const pending = urlsKey.split("\n").filter((url) => url && !prefetchedUrls.has(url));
    if (pending.length === 0 || !connectionAllowsPrefetch()) return;

    let cancelled = false;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const run = () => {
      if (cancelled) return;
      for (const url of pending) {
        if (prefetchedUrls.has(url)) continue;
        prefetchedUrls.add(url);
        const img = new Image();
        img.decoding = "async";
        img.setAttribute("fetchpriority", "low");
        img.src = url;
      }
    };

    const schedule = () => {
      if (cancelled) return;
      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(run, { timeout: 4000 });
      } else {
        timeoutHandle = window.setTimeout(run, 1500);
      }
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, [urlsKey]);
}
