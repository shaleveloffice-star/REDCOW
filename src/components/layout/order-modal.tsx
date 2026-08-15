"use client";

import { useEffect, useId, useRef } from "react";

import {
  IconBurgerMark,
  IconClose,
  IconDeliveryMark
} from "@/components/shared/site-icons";
import { useTranslations } from "@/components/providers/locale-provider";
import { focusElement, getFocusableElements, trapFocus } from "@/lib/a11y/focus-trap";
import { trackEvent } from "@/lib/analytics";

type OrderModalProps = {
  open: boolean;
  onClose: () => void;
  pickupUrl: string;
  deliveryUrl: string;
  location: string;
};

export function OrderModal({
  open,
  onClose,
  pickupUrl,
  deliveryUrl,
  location
}: OrderModalProps) {
  const t = useTranslations();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pickupExternal = pickupUrl.startsWith("http");
  const deliveryExternal = deliveryUrl.startsWith("http");

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    if (!dialog) {
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    focusElement(closeRef.current ?? getFocusableElements(dialog)[0]);
    const releaseTrap = trapFocus(dialog);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      releaseTrap();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="order-modal-root" role="presentation">
      <button type="button" className="order-modal-backdrop" aria-label={t.orderModal.close} onClick={onClose} />
      <div
        ref={dialogRef}
        className="order-modal"
        role="dialog"
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
            {...(pickupExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            onClick={() => {
              trackEvent("order_click", { location, order_type: "pickup" });
              onClose();
            }}
          >
            <IconBurgerMark className="order-modal-option-icon" />
            <span className="order-modal-option-label">{t.orderModal.pickup}</span>
          </a>

          <div className="order-modal-divider" aria-hidden="true" />

          <a
            className="order-modal-option"
            href={deliveryUrl}
            {...(deliveryExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            onClick={() => {
              trackEvent("order_click", { location, order_type: "delivery" });
              onClose();
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
