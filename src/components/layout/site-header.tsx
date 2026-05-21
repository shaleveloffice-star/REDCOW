import Link from "next/link";
import { SiteLogo } from "@/components/layout/site-logo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="ניווט ראשי">
        <SiteLogo />
        <div className="site-menu">
          <input className="site-menu-checkbox" id="site-menu-toggle" type="checkbox" />
          <label className="site-menu-toggle" htmlFor="site-menu-toggle" aria-label="פתיחת תפריט">
            <span />
            <span />
            <span />
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
