const openingSoonItems = [
  { icon: "⌖", label: "מרכז הארץ" },
  { icon: "▣", label: "איסוף עצמי" },
  { icon: "♨", label: "משלוחים" },
  { icon: "≋", label: "תפריט קלאסי" }
];

export function VisitUsSection() {
  return (
    <section className="visit-section" aria-labelledby="visit-title">
      <div className="visit-shell">
        <div className="visit-copy">
          <p className="visit-kicker">Visit Us</p>
          <h2 id="visit-title">
            הסניף הראשון
            <strong>בדרך.</strong>
          </h2>
          <p>
            אנחנו עובדים על הלוקיישן הראשון של NB Burger. בקרוב תוכלו להגיע,
            להזמין, לקחת ולתת את הביס הראשון.
          </p>
          <p className="visit-note">
            רוצים לדעת ראשונים כשאנחנו נפתחים? השאירו פרטים ונעדכן אתכם.
          </p>
          <div className="visit-actions">
            <a className="visit-primary" href="#contact">
              עדכנו אותי בפתיחה
            </a>
            <a className="visit-secondary" href="/menu">
              צפו בתפריט
              <span>‹</span>
            </a>
          </div>
        </div>
        <div className="visit-card">
          <div className="visit-card-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h3>Opening Soon</h3>
          <div className="visit-card-divider" />
          <ul>
            {openingSoonItems.map((item) => (
              <li key={item.label}>
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </li>
            ))}
          </ul>
          <div className="visit-card-divider" />
        </div>
      </div>
    </section>
  );
}
