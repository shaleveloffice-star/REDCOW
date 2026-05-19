const experienceItems = [
  { number: "01", text: "טעם נקי וברור" },
  { number: "02", text: "מנות שנבנות נכון" },
  { number: "03", text: "חוויה קלאסית בלי רעש" }
];

export function ExperienceSection() {
  return (
    <section className="experience-section" aria-labelledby="experience-title">
      <div className="experience-visual" aria-hidden="true" />
      <div className="experience-shell">
        <div className="experience-content">
          <p className="experience-kicker">The Experience</p>
          <h2 id="experience-title">
            חוויית
            <strong>RED COW</strong>
          </h2>
          <h3>לא רק המבורגר.</h3>
          <p>
            חוויה שלמה סביב ביס אחד מדויק. מהלחמנייה ועד הרוטב, מהצלייה ועד
            האווירה, כל פרט נבחר כדי להרגיש פשוט אבל ברמה גבוהה.
          </p>
          <div className="experience-list">
            {experienceItems.map((item) => (
              <div className="experience-list-item" key={item.number}>
                <span>{item.number}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          <a className="experience-button" href="/menu">
            צפה בתפריט
          </a>
        </div>
      </div>
    </section>
  );
}
