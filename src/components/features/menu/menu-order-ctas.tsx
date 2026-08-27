"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { OrderModal } from "@/components/layout/order-modal";
import {
  IconBurgerMark,
  IconDeliveryMark,
  IconLocationPinFilled
} from "@/components/shared/site-icons";
import { useTranslations } from "@/components/providers/locale-provider";
import { trackEvent } from "@/lib/analytics";

type MenuOrderCtasProps = {
  pickupUrl: string;
  deliveryUrl: string;
};

export function MenuOrderCtas({ pickupUrl, deliveryUrl }: MenuOrderCtasProps) {
  const t = useTranslations();
  const [orderOpen, setOrderOpen] = useState(false);
  const orderButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <section className="menu-bleecker-ctas" aria-label={t.orderModal.title}>
        <button
          ref={orderButtonRef}
          type="button"
          className="menu-bleecker-cta"
          onClick={() => {
            trackEvent("order_open", { source: "menu" });
            setOrderOpen(true);
          }}
        >
          <IconBurgerMark className="menu-bleecker-cta-icon" />
          <span>{t.orderModal.pickup}</span>
        </button>

        <a
          className="menu-bleecker-cta"
          href={deliveryUrl}
          onClick={() => {
            // Consistent funnel: open intent, then known delivery choice.
            trackEvent("order_open", { source: "menu" });
            trackEvent("order_delivery", { source: "menu" });
          }}
        >
          <IconDeliveryMark className="menu-bleecker-cta-icon" />
          <span>{t.orderModal.delivery}</span>
        </a>

        <Link
          className="menu-bleecker-cta"
          href="/locations"
          onClick={() => trackEvent("location_open", { source: "menu" })}
        >
          <IconLocationPinFilled className="menu-bleecker-cta-icon" />
          <span>{t.menuPage.viewLocations}</span>
        </Link>
      </section>

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        pickupUrl={pickupUrl}
        deliveryUrl={deliveryUrl}
        source="menu"
        returnFocusRef={orderButtonRef}
      />
    </>
  );
}
