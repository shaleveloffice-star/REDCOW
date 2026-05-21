import Link from "next/link";
import type { Branch } from "@/types/content";

const openingSoonItems = [
  { icon: "⌖", label: "מרכז הארץ" },
  { icon: "▣", label: "איסוף עצמי" },
  { icon: "♨", label: "משלוחים" },
  { icon: "≋", label: "תפריט קלאסי" }
];

function BranchesComingSoon() {
  return (
    <div className="branches-coming-soon">
      <div className="branches-coming-copy">
        <h2>הסניף הראשון בדרך</h2>
        <p>
          אנחנו עדיין בוחנים את הלוקיישן המדויק לסניף הראשון של NB Burger. ברגע שנחליט —
          נעדכן כאן את הכתובת, שעות הפתיחה וניווט.
        </p>
        <p className="branches-coming-note">
          רוצים לדעת ראשונים כשנפתח? השאירו פרטים בטופס בתחתית הדף, ונחזור אליכם עם העדכון.
        </p>
        <div className="branches-coming-actions">
          <a className="visit-primary" href="#contact">
            עדכנו אותי בפתיחה
          </a>
          <Link className="visit-secondary" href="/menu">
            צפו בתפריט
            <span>‹</span>
          </Link>
        </div>
      </div>
      <div className="visit-card branches-coming-card">
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
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  return (
    <article className="branches-card">
      <h2>{branch.name}</h2>
      <p className="branches-card-address">
        {branch.address}, {branch.city}
      </p>
      <dl className="branches-card-details">
        <div>
          <dt>טלפון</dt>
          <dd>
            <a href={`tel:${branch.phone.replace(/\s/g, "")}`}>{branch.phone}</a>
          </dd>
        </div>
        <div>
          <dt>שעות פתיחה</dt>
          <dd>{branch.openingHours}</dd>
        </div>
      </dl>
      {branch.wazeUrl ? (
        <a className="branches-card-nav" href={branch.wazeUrl} rel="noopener noreferrer" target="_blank">
          ניווט ב-Waze
        </a>
      ) : null}
    </article>
  );
}

export function BranchesPageView({ branches }: { branches: Branch[] }) {
  if (branches.length === 0) {
    return <BranchesComingSoon />;
  }

  return (
    <ul className="branches-grid">
      {branches.map((branch) => (
        <li key={branch.id}>
          <BranchCard branch={branch} />
        </li>
      ))}
    </ul>
  );
}
