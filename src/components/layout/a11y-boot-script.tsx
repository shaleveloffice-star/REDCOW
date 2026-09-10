"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";

import { A11Y_BOOT_SCRIPT } from "@/lib/a11y/preferences";

/**
 * Injects the a11y FOUC boot into the SSR HTML stream outside the client React tree.
 * Avoids React 19's "script tag while rendering component" console error.
 */
export function A11yBootScript() {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return (
    <script
      id="nb-a11y-boot"
      // eslint-disable-next-line react/no-danger -- trusted inline boot only
      dangerouslySetInnerHTML={{ __html: A11Y_BOOT_SCRIPT }}
    />
    );
  });

  return null;
}
