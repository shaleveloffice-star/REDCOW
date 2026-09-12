"use client";

import { useId, useLayoutEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";

import { CustomerClubSignupForm } from "@/components/features/home/customer-club-signup-form";
import { IconClose } from "@/components/shared/site-icons";
import { useTranslations } from "@/components/providers/locale-provider";
import { mountModal } from "@/lib/a11y/focus-trap";
import type { AnalyticsSource } from "@/lib/analytics";

import "./customer-club.css";

type CustomerClubModalProps = {
  open: boolean;
  onClose: () => void;
  source?: AnalyticsSource;
  returnFocusRef?: RefObject<HTMLElement | null>;
  previewSuccess?: boolean;
};

export function CustomerClubModal({
  open,
  onClose,
  source = "footer",
  returnFocusRef,
  previewSuccess = false
}: CustomerClubModalProps) {
  const t = useTranslations();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    if (!open) return;
    if (!rootRef.current || !dialogRef.current) return;
    return mountModal(rootRef.current, dialogRef.current, () => onCloseRef.current(), returnFocusRef?.current);
  }, [open, returnFocusRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div ref={rootRef} className="customer-club-modal-root" role="presentation">
      <button
        type="button"
        className="customer-club-modal-backdrop"
        aria-label={t.customerClub.close}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="customer-club-modal"
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="sr-only">
          {t.customerClub.title}
        </h2>
        <button
          type="button"
          className="customer-club-modal-close"
          aria-label={t.customerClub.close}
          onClick={onClose}
        >
          <IconClose />
        </button>

        <CustomerClubSignupForm
          source={source}
          className="customer-club-modal-form"
          previewSuccess={previewSuccess}
        />
      </div>
    </div>,
    document.body
  );
}
