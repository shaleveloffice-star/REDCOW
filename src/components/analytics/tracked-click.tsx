"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { trackEvent, type AnalyticsSource } from "@/lib/analytics";

type TrackedAnchorProps = Omit<ComponentProps<"a">, "onClick"> & {
  eventName: string;
  source: AnalyticsSource;
  eventParams?: Record<string, unknown>;
  children: ReactNode;
};

/** Anchor that fires one GA4 business event on click, then follows href normally. */
export function TrackedAnchor({
  eventName,
  source,
  eventParams,
  children,
  ...props
}: TrackedAnchorProps) {
  return (
    <a
      {...props}
      onClick={() => {
        trackEvent(eventName, { source, ...eventParams });
      }}
    >
      {children}
    </a>
  );
}

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  eventName: string;
  source: AnalyticsSource;
  eventParams?: Record<string, unknown>;
};

export function TrackedLink({ eventName, source, eventParams, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={() => {
        trackEvent(eventName, { source, ...eventParams });
      }}
    />
  );
}
