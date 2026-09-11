"use client";

import { useCallback, useRef, useState } from "react";

import { CustomerClubModal } from "@/components/features/home/customer-club-modal";
import { useTranslations } from "@/components/providers/locale-provider";
import { trackEvent } from "@/lib/analytics";

export function FooterCustomerClubCta() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    trackEvent("club_open", { source: "footer" });
    setOpen(true);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="site-footer-club-btn"
        onClick={handleOpen}
      >
        {t.footer.clubCta}
      </button>
      <CustomerClubModal
        open={open}
        onClose={() => setOpen(false)}
        source="footer"
        returnFocusRef={buttonRef}
      />
    </>
  );
}
