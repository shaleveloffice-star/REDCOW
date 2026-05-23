import Link from "next/link";
import { SiteBrandWordmark } from "@/components/layout/site-brand-wordmark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="ניווט ראשי">
        <SiteBrandWordmark />
        <div className="site-menu">
          <input className="site-menu-checkbox" id="site-menu-toggle" type="checkbox" />
          <label className="site-menu-toggle" htmlFor="site-menu-toggle" aria-label="פתיחת תפריט">
            <span className="site-menu-toggle-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="site-menu-line site-menu-line--top"
                  d="M6 8h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  className="site-menu-line site-menu-line--mid"
                  d="M9 12h6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  className="site-menu-line site-menu-line--bot"
                  d="M6 16h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </label>
          <div className="site-menu-panel">
            <Link href="/menu">תפריט</Link>
            <Link href="/about">אודות</Link>
            <Link href="/branches">סניפים</Link>
            <a href="/#gallery">גלריה</a>
            <Link href="/admin">ניהול</Link>
            <Link href="/privacy-policy">מדיניות פרטיות</Link>
            <a href="/#contact">צור קשר</a>
          </div>
        </div>
      </nav>
    </header>
  );
}
