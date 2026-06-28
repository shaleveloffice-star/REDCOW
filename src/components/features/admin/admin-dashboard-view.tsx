import Link from "next/link";
import {
  ArrowUpLeft,
  ExternalLink,
  FolderTree,
  Link2,
  Mail,
  MapPin,
  Newspaper,
  Sparkles,
  UtensilsCrossed,
  Zap
} from "lucide-react";

type DashboardStat = {
  id: string;
  label: string;
  value: number;
  href: string;
  icon: "menu" | "categories" | "branches" | "press" | "messages" | "links";
  accent: "red" | "gold" | "cream" | "ember";
};

type AdminDashboardViewProps = {
  stats: DashboardStat[];
  firebaseConnected: boolean;
};

const ICONS = {
  menu: UtensilsCrossed,
  categories: FolderTree,
  branches: MapPin,
  press: Newspaper,
  messages: Mail,
  links: Link2
} as const;

const QUICK_ACTIONS = [
  { href: "/admin/menu", label: "הוסף מנה חדשה", desc: "עדכון תפריט ומחירים", external: false },
  { href: "/admin/settings", label: "הגדרות אתר", desc: "Hero, מדיה וקישורים", external: false },
  { href: "/admin/contact-messages", label: "הודעות נכנסות", desc: "יצירת קשר מהאתר", external: false },
  { href: "/", label: "צפייה באתר", desc: "פתיחה בטאב חדש", external: true }
] as const;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "בוקר טוב";
  if (hour < 17) return "צהריים טובים";
  if (hour < 21) return "ערב טוב";
  return "לילה טוב";
}

function formatHebrewDate() {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

export function AdminDashboardView({ stats, firebaseConnected }: AdminDashboardViewProps) {
  const totalRecords = stats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-hero">
        <div className="admin-dashboard-hero-copy">
          <p className="admin-dashboard-kicker">
            <Sparkles size={14} strokeWidth={2} aria-hidden="true" />
            {getGreeting()}
          </p>
          <h1 className="admin-dashboard-title">מרכז הניהול</h1>
          <p className="admin-dashboard-lead">{formatHebrewDate()}</p>
        </div>

        <div className="admin-dashboard-hero-meta">
          <div className="admin-status-pill">
            <span
              className={`admin-status-dot${firebaseConnected ? " is-live" : " is-local"}`}
              aria-hidden="true"
            />
            {firebaseConnected ? "Firebase מחובר" : "מצב מקומי (Fallback)"}
          </div>
          <div className="admin-hero-stat">
            <span className="admin-hero-stat-value">{totalRecords}</span>
            <span className="admin-hero-stat-label">רשומות פעילות</span>
          </div>
        </div>
      </header>

      <section className="admin-bento-grid" aria-label="סטטיסטיקות">
        {stats.map((stat, index) => {
          const Icon = ICONS[stat.icon];

          return (
            <Link
              key={stat.id}
              href={stat.href}
              className={`admin-stat-tile admin-stat-tile--${stat.accent}`}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="admin-stat-tile-top">
                <span className="admin-stat-tile-icon" aria-hidden="true">
                  <Icon strokeWidth={1.75} size={20} />
                </span>
                <ArrowUpLeft className="admin-stat-tile-arrow" size={16} strokeWidth={2} aria-hidden="true" />
              </div>
              <strong className="admin-stat-tile-value">{stat.value}</strong>
              <span className="admin-stat-tile-label">{stat.label}</span>
            </Link>
          );
        })}
      </section>

      <div className="admin-dashboard-panels">
        <section className="admin-panel admin-panel--actions" aria-labelledby="admin-quick-actions">
          <div className="admin-panel-head">
            <Zap size={18} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <h2 id="admin-quick-actions" className="admin-panel-title">
                פעולות מהירות
              </h2>
              <p className="admin-panel-desc">קיצורי דרך לניהול שוטף</p>
            </div>
          </div>

          <ul className="admin-action-list">
            {QUICK_ACTIONS.map((action) => (
              <li key={action.href}>
                {action.external ? (
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-action-link"
                  >
                    <span>
                      <strong>{action.label}</strong>
                      <small>{action.desc}</small>
                    </span>
                    <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
                  </a>
                ) : (
                  <Link href={action.href} className="admin-action-link">
                    <span>
                      <strong>{action.label}</strong>
                      <small>{action.desc}</small>
                    </span>
                    <ArrowUpLeft size={16} strokeWidth={2} aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-panel admin-panel--status" aria-labelledby="admin-system-status">
          <div className="admin-panel-head">
            <Sparkles size={18} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <h2 id="admin-system-status" className="admin-panel-title">
                מצב המערכת
              </h2>
              <p className="admin-panel-desc">סביבת עבודה ואחסון</p>
            </div>
          </div>

          <dl className="admin-status-list">
            <div className="admin-status-row">
              <dt>אחסון נתונים</dt>
              <dd>{firebaseConnected ? "Firestore" : "JSON מקומי"}</dd>
            </div>
            <div className="admin-status-row">
              <dt>סנכרון</dt>
              <dd>{firebaseConnected ? "בזמן אמת" : "לוקלי בלבד"}</dd>
            </div>
            <div className="admin-status-row">
              <dt>אזורי ניהול</dt>
              <dd>{stats.length} מודולים</dd>
            </div>
          </dl>

          <p className="admin-status-footnote">
            {firebaseConnected
              ? "שינויים באדמין נשמרים ישירות ל-Firestore."
              : "הגדר Firebase ב-.env כדי לשמור לענן."}
          </p>
        </section>
      </div>
    </div>
  );
}
