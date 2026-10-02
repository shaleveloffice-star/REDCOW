"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { mountModal } from "@/lib/a11y/focus-trap";
import { MenuItemImage } from "@/components/shared/menu-item-image";
import { isVideoMediaUrl } from "@/lib/menu-media";

export function SauceDialog({ imageZoom, name, description, imageUrl, closeLabel, onClose, trigger, dir }: {
  imageZoom?: number; name: string; description: string; imageUrl: string; closeLabel: string;
  onClose: () => void; trigger: HTMLElement | null; dir: "rtl" | "ltr";
}) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const titleId = useId();
  const descriptionId = useId();
  useLayoutEffect(() => {
    if (root.current && dialog.current) return mountModal(root.current, dialog.current, () => close.current(), trigger);
  }, [trigger]);
  return createPortal(
    <div className="sauce-dialog-root" ref={root} dir={dir}>
      <div className="sauce-dialog-backdrop" aria-hidden="true" onClick={onClose} />
      <div className="sauce-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} tabIndex={-1}>
        <button type="button" className="sauce-dialog-close" onClick={onClose} aria-label={closeLabel}>×</button>
        {imageUrl && !isVideoMediaUrl(imageUrl) ? <MenuItemImage zoom={imageZoom} src={imageUrl} alt={name} width={240} height={240} sizes="240px" className="sauce-dialog-image" /> : null}
        <h2 id={titleId}>{name}</h2>
        <p id={descriptionId}>{description}</p>
      </div>
    </div>, document.body
  );
}
