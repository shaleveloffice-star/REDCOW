"use client";

import { useId, useLayoutEffect, useRef, type RefObject } from "react";

import {
  IconBurgerMark,
  IconClose,
  IconDeliveryMark
} from "@/components/shared/site-icons";
import { useTranslations } from "@/components/providers/locale-provider";
import { mountModal } from "@/lib/a11y/focus-trap";
import { trackEvent, type AnalyticsSource } from "@/lib/analytics";

type OrderModalProps = {
  open: boolean;
  onClose: () => void;
  pickupUrl: string;
  deliveryUrl: string;
  source: AnalyticsSource;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export function OrderModal({
  open,
  onClose,
  pickupUrl,
  deliveryUrl,
  source,
  returnFocusRef
}: OrderModalProps) {
  const t = useTranslations();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    if (!open) return;

    if (!rootRef.current || !dialogRef.current) return;
    return mountModal(rootRef.current, dialogRef.current, () => onCloseRef.current(), returnFocusRef?.current);
  }, [open, returnFocusRef]);

  if (!open) return null;

  return (
    <div ref={rootRef} className="order-modal-root" role="presentation">
      <button type="button" className="order-modal-backdrop" aria-label={t.orderModal.close} onClick={onClose} />
      <div
        ref={dialogRef}
        className="order-modal"
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="sr-only">
          {t.orderModal.title}
        </h2>
        <button
          ref={closeRef}
          type="button"
          className="order-modal-close"
          aria-label={t.orderModal.close}
          onClick={onClose}
        >
          <IconClose />
        </button>

        <div className="order-modal-options">
          <a
            className="order-modal-option"
            href={pickupUrl}
            onClick={() => {
              trackEvent("order_pickup", { source });
              // Same-tab navigation: do not close before the browser follows href
              // (closing first broke Samsung Internet / blocked popups with target=_blank).
            }}
          >
            <IconBurgerMark className="order-modal-option-icon" />
            <span className="order-modal-option-label">{t.orderModal.pickup}</span>
          </a>

          <div className="order-modal-divider" aria-hidden="true" />

          <a
            className="order-modal-option"
            href={deliveryUrl}
            onClick={() => {
              trackEvent("order_delivery", { source });
            }}
          >
            <IconDeliveryMark className="order-modal-option-icon" />
            <span className="order-modal-option-label">{t.orderModal.delivery}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
