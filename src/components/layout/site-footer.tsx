const footerNavItems = ["תפריט", "גלריה", "סניפים", "צור קשר"];

const footerInfoItems = [
  { icon: "▦", label: "פתיחה בקרוב" },
  { icon: "⌖", label: "מרכז הארץ" },
  { icon: "♨", label: "משלוחים" },
  { icon: "▣", label: "איסוף עצמי" }
];

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-top-line">
        <span className="footer-burger-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
      <div className="footer-shell">
        <section className="footer-brand" aria-label="Red Cow">
          <h2>RED COW</h2>
          <p>Classic Burgers</p>
          <span />
          <strong>
            המבורגר קלאסי.
            <br />
            בלי רעש מיותר.
          </strong>
        </section>

        <nav className="footer-column" aria-label="ניווט תחתון">
          <h3>ניווט</h3>
          {footerNavItems.map((item) => (
            <a href={item === "צור קשר" ? "#contact" : "#menu"} key={item}>
              {item}
            </a>
          ))}
        </nav>

        <section className="footer-column footer-info" aria-label="מידע">
          <h3>מידע</h3>
          {footerInfoItems.map((item) => (
            <p key={item.label}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </p>
          ))}
        </section>

        <section className="footer-signup" aria-labelledby="footer-signup-title">
          <h3 id="footer-signup-title">הביס הראשון בדרך.</h3>
          <p>השאירו פרטים, ונעדכן אתכם כשהדלתות נפתחות.</p>
          <form>
            <label>
              <span>שם מלא</span>
              <input name="fullName" type="text" />
            </label>
            <label>
              <span>מספר טלפון</span>
              <input name="phone" type="tel" />
            </label>
            <label className="footer-checkbox">
              <input name="approval" type="checkbox" />
              <span>אני מאשר/ת קבלת עדכונים ויצירת קשר בהתאם למדיניות הפרטיות.</span>
            </label>
            <button type="button">עדכנו אותי</button>
          </form>
        </section>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Red Cow. All rights reserved.</p>
        <div className="footer-socials">
          <a aria-label="Instagram" className="footer-social instagram" href="https://instagram.com/redcow">
            <span />
          </a>
          <a aria-label="TikTok" className="footer-social tiktok" href="https://tiktok.com">
            <span />
          </a>
          <a aria-label="Facebook" className="footer-social facebook" href="https://facebook.com">
            <span />
          </a>
        </div>
      </div>
    </footer>
  );
}
