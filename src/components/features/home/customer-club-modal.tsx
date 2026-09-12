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
};

export function CustomerClubModal({
  open,
  onClose,
  source = "footer",
  returnFocusRef
}: CustomerClubModalProps) {
  const t = useTranslations();
  const titleId = useId();
  const leadId = useId();
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
        aria-describedby={leadId}
      >
        <button
          type="button"
          className="customer-club-modal-close"
          aria-label={t.customerClub.close}
          onClick={onClose}
        >
          <IconClose />
        </button>

        <header className="customer-club-modal-header">
          <p className="customer-club-modal-kicker">{t.customerClub.kicker}</p>
          <h2 id={titleId} className="customer-club-modal-title">
            {t.customerClub.title}
          </h2>
          <p id={leadId} className="customer-club-modal-lead">
            {t.customerClub.lead}
          </p>
        </header>

        <CustomerClubSignupForm source={source} className="customer-club-modal-form" />
      </div>
    </div>,
    document.body
  );
}
