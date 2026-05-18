import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="ניווט ראשי">
        <Link href="/" className="site-logo">
          <span className="site-logo-crown">♛</span>
          <span>RED COW</span>
          <small>BURGER</small>
        </Link>
        <div className="site-menu">
          <input className="site-menu-checkbox" id="site-menu-toggle" type="checkbox" />
          <label className="site-menu-toggle" htmlFor="site-menu-toggle" aria-label="פתיחת תפריט">
            <span />
            <span />
            <span />
          </label>
          <div className="site-menu-panel">
            <a href="#menu">תפריט</a>
            <Link href="/about">אודות</Link>
            <a href="#branches">סניפים</a>
            <a href="#gallery">גלריה</a>
            <Link href="/admin">ניהול</Link>
            <Link href="/privacy-policy">מדיניות פרטיות</Link>
            <a href="#contact">צור קשר</a>
            <a className="mobile-order-link" href="#menu">
              הזמן עכשיו
            </a>
          </div>
        </div>
        <a className="site-order-button" href="#menu">
          הזמן עכשיו
        </a>
      </nav>
    </header>
  );
}
