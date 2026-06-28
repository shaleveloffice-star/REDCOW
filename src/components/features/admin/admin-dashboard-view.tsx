import Link from "next/link";
import {
  ArrowUpLeft,
  BarChart3,
  ExternalLink,
  FolderTree,
  Link2,
  Mail,
  MapPin,
  Newspaper,
  PieChart,
  TrendingUp,
  UtensilsCrossed,
  Zap
} from "lucide-react";

import {
  BarChart,
  ChartLegend,
  DonutChart,
  getChartColor,
  HorizontalBars,
  Sparkline
} from "@/components/features/admin/admin-charts";

type DashboardStat = {
  id: string;
  label: string;
  value: number;
  href: string;
  icon: "menu" | "categories" | "branches" | "press" | "messages" | "links";
};

type CategoryBreakdown = {
  label: string;
  value: number;
  active: number;
};

type AdminDashboardViewProps = {
  stats: DashboardStat[];
  categoryBreakdown: CategoryBreakdown[];
  activeMenuItems: number;
  totalMenuItems: number;
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

export function AdminDashboardView({
  stats,
  categoryBreakdown,
  activeMenuItems,
  totalMenuItems,
  firebaseConnected
}: AdminDashboardViewProps) {
  const totalRecords = stats.reduce((sum, stat) => sum + stat.value, 0);
  const activePct =
    totalMenuItems > 0 ? Math.round((activeMenuItems / totalMenuItems) * 100) : 0;

  const donutSegments = stats.map((stat, index) => ({
    label: stat.label,
    value: stat.value,
    color: getChartColor(index)
  }));

  const sparkValues =
    categoryBreakdown.length > 0
      ? categoryBreakdown.map((item) => item.value)
      : stats.map((stat) => stat.value);

  const moduleBars = stats.map((stat) => ({
    label: stat.label,
    value: stat.value,
    max: Math.max(...stats.map((s) => s.value), 1),
    href: stat.href
  }));

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-hero">
        <div className="admin-dashboard-hero-grid">
          <div className="admin-dashboard-hero-copy">
            <p className="admin-dashboard-kicker">{getGreeting()}</p>
            <h1 className="admin-dashboard-title">מרכז הניהול</h1>
            <p className="admin-dashboard-lead">{formatHebrewDate()}</p>

            <div className="admin-hero-metrics">
              <div className="admin-hero-metric">
                <span className="admin-hero-metric-value">{totalRecords}</span>
                <span className="admin-hero-metric-label">רשומות במערכת</span>
              </div>
              <div className="admin-hero-metric">
                <span className="admin-hero-metric-value">{activePct}%</span>
                <span className="admin-hero-metric-label">מנות פעילות</span>
              </div>
              <div className="admin-hero-metric">
                <span
                  className={`admin-status-dot${firebaseConnected ? " is-live" : " is-local"}`}
                  aria-hidden="true"
                />
                <span className="admin-hero-metric-label">
                  {firebaseConnected ? "Firebase מחובר" : "מצב מקומי"}
                </span>
              </div>
            </div>
          </div>

          <div className="admin-hero-chart-card">
            <div className="admin-panel-head admin-panel-head--compact">
              <TrendingUp size={18} strokeWidth={1.75} aria-hidden="true" />
              <div>
                <h2 className="admin-panel-title">מגמת תפריט</h2>
                <p className="admin-panel-desc">מנות לפי קטגוריה</p>
              </div>
            </div>
            <Sparkline values={sparkValues} />
          </div>
        </div>
      </header>

      <div className="admin-dashboard-bento">
        <section className="admin-panel admin-panel--chart admin-bento-wide" aria-labelledby="chart-distribution">
          <div className="admin-panel-head">
            <PieChart size={18} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <h2 id="chart-distribution" className="admin-panel-title">
                התפלגות תוכן
              </h2>
              <p className="admin-panel-desc">חלוקה לפי מודולי ניהול</p>
            </div>
          </div>

          <div className="admin-chart-split">
            <DonutChart
              segments={donutSegments}
              centerValue={totalRecords}
              centerLabel="סה״כ"
            />
            <ChartLegend segments={donutSegments} />
          </div>
        </section>

        <section className="admin-panel admin-panel--chart" aria-labelledby="chart-modules">
          <div className="admin-panel-head">
            <BarChart3 size={18} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <h2 id="chart-modules" className="admin-panel-title">
                עוצמת מודולים
              </h2>
              <p className="admin-panel-desc">נפח נתונים יחסי</p>
            </div>
          </div>
          <HorizontalBars items={moduleBars} />
        </section>

        <section className="admin-bento-stats" aria-label="סטטיסטיקות">
          {stats.map((stat) => {
            const Icon = ICONS[stat.icon];

            return (
              <Link key={stat.id} href={stat.href} className="admin-stat-tile">
                <div className="admin-stat-tile-top">
                  <span className="admin-stat-tile-icon" aria-hidden="true">
                    <Icon strokeWidth={1.75} size={18} />
                  </span>
                  <ArrowUpLeft className="admin-stat-tile-arrow" size={15} strokeWidth={2} aria-hidden="true" />
                </div>
                <strong className="admin-stat-tile-value">{stat.value}</strong>
                <span className="admin-stat-tile-label">{stat.label}</span>
              </Link>
            );
          })}
        </section>

        <section
          className="admin-panel admin-panel--chart admin-bento-wide"
          aria-labelledby="chart-categories"
        >
          <div className="admin-panel-head">
            <UtensilsCrossed size={18} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <h2 id="chart-categories" className="admin-panel-title">
                מנות לפי קטגוריה
              </h2>
              <p className="admin-panel-desc">
                {activeMenuItems} פעילות מתוך {totalMenuItems} מנות
              </p>
            </div>
          </div>

          {categoryBreakdown.length > 0 ? (
            <BarChart
              items={categoryBreakdown.map((item) => ({
                label: item.label,
                value: item.value,
                sublabel: `${item.active} פעילות`
              }))}
            />
          ) : (
            <p className="admin-chart-empty">אין עדיין קטגוריות בתפריט</p>
          )}
        </section>

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
      </div>
    </div>
  );
}
