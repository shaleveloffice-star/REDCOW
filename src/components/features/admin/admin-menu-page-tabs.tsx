"use client";

import { useEffect, useState, type ReactNode } from "react";

const TABS = [
  { key: "homepage", label: "תפריט בדף הבית - התפריט שלנו" },
  { key: "manage", label: "ניהול תפריט" },
  { key: "ingredients", label: "מרכיבים" },
  { key: "page", label: "באנר ו-SEO - דף התפריט" }
] as const;

type TabKey = (typeof TABS)[number]["key"];

const DEFAULT_TAB: TabKey = "manage";

function isTabKey(value: string | null): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

/** Panels stay mounted while hidden so unsaved edits survive tab switches. */
export function AdminMenuPageTabs({ panels }: { panels: Record<TabKey, ReactNode> }) {
  const [active, setActive] = useState<TabKey>(DEFAULT_TAB);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (isTabKey(fromUrl)) setActive(fromUrl);
  }, []);

  function select(key: TabKey) {
    setActive(key);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", key);
    window.history.replaceState(window.history.state, "", url);
  }

  return (
    <>
      <div className="admin-club-tabs admin-menu-page-tabs" role="tablist" aria-label="ניהול תפריט">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            id={`admin-menu-tab-${tab.key}`}
            className={`admin-club-tab${active === tab.key ? " is-active" : ""}`}
            role="tab"
            aria-selected={active === tab.key}
            aria-controls={`admin-menu-panel-${tab.key}`}
            onClick={() => select(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {TABS.map((tab) => (
        <div
          key={tab.key}
          id={`admin-menu-panel-${tab.key}`}
          role="tabpanel"
          aria-labelledby={`admin-menu-tab-${tab.key}`}
          className="admin-menu-page-panel"
          hidden={active !== tab.key}
        >
          {panels[tab.key]}
        </div>
      ))}
    </>
  );
}
