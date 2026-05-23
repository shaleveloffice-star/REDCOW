const qualityItems = [
  {
    number: "01",
    title: "בשר איכותי",
    description: "צלייה מדויקת וטעם עמוק של גריל."
  },
  {
    number: "02",
    title: "לחמנייה נכונה",
    description: "רכה, קלויה, ומחזיקה את הביס כמו שצריך."
  },
  {
    number: "03",
    title: "רטבים מדויקים",
    description: "לא להציף, רק לחבר את כל הטעמים."
  }
];

export function QualitySection() {
  return (
    <section id="atmosphere" className="quality-section" aria-labelledby="quality-title">
      <div className="quality-shell">
        <div className="quality-top-line">
          <span className="quality-burger-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>
        <h2 id="quality-title">המבורגר טוב מתחיל בפשטות.</h2>
        <div className="quality-tags" aria-label="עקרונות ההמבורגר">
          <span>בשר נכון</span>
          <span>לחמנייה נכונה</span>
          <span>רוטב מדויק</span>
        </div>
        <p className="quality-note">בלי רעש מיותר.</p>
        <div className="quality-grid">
          {qualityItems.map((item) => (
            <article className="quality-item" key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
