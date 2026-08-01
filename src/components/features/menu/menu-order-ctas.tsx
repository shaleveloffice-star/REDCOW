"use client";

import Link from "next/link";
import { useState } from "react";

import { OrderModal } from "@/components/layout/order-modal";
import {
  IconBurgerMark,
  IconDeliveryMark,
  IconLocationPinFilled
} from "@/components/shared/site-icons";
import { useTranslations } from "@/components/providers/locale-provider";

type MenuOrderCtasProps = {
  pickupUrl: string;
  deliveryUrl: string;
};

export function MenuOrderCtas({ pickupUrl, deliveryUrl }: MenuOrderCtasProps) {
  const t = useTranslations();
  const [orderOpen, setOrderOpen] = useState(false);
  const deliveryExternal = deliveryUrl.startsWith("http");

  return (
    <>
      <section className="menu-bleecker-ctas" aria-label={t.orderModal.title}>
        <button type="button" className="menu-bleecker-cta" onClick={() => setOrderOpen(true)}>
          <IconBurgerMark className="menu-bleecker-cta-icon" />
          <span>{t.orderModal.pickup}</span>
        </button>

        <a
          className="menu-bleecker-cta"
          href={deliveryUrl}
          {...(deliveryExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <IconDeliveryMark className="menu-bleecker-cta-icon" />
          <span>{t.orderModal.delivery}</span>
        </a>

        <Link className="menu-bleecker-cta" href="/locations">
          <IconLocationPinFilled className="menu-bleecker-cta-icon" />
          <span>{t.menuPage.viewLocations}</span>
        </Link>
      </section>

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        pickupUrl={pickupUrl}
        deliveryUrl={deliveryUrl}
      />
    </>
  );
}
