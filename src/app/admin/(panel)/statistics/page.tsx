import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdminSession } from "@/lib/auth/get-current-admin-session";
import { getAdminFirestore } from "@/lib/firebase/admin-firestore";

type Totals = { views: number; seconds: number; orders: number; phones: number; directions: number };
type Bar = { label: string; value: number };

function BarChart({ title, rows }: { title: string; rows: Bar[] }) {
  const maximum = Math.max(1, ...rows.map(row => row.value));
  return <section className="admin-card">
    <h2>{title}</h2>
    <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
      {rows.map(({ label, value }) => <li key={label}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <bdi style={{ overflowWrap: "anywhere" }}>{label}</bdi><strong>{value.toLocaleString("he-IL")}</strong>
        </div>
        <div aria-hidden="true" style={{ background: "#e7eaf1", borderRadius: 9, overflow: "hidden" }}>
          <div style={{ height: 8, width: `${100 * value / maximum}%`, background: "#465cb2" }} />
        </div>
      </li>)}
    </ul>
  </section>;
}
export default async function StatisticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");
  const requested = Number((await searchParams).days);
  const days = [1, 7, 30].includes(requested) ? requested : 7;
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jerusalem" }).format(new Date());
  const start = new Date(today + "T12:00:00Z");
  start.setUTCDate(start.getUTCDate() - days + 1);
  const pages = new Map<string, Totals>();
  const daily = new Map<string, number>();
  for (const date = new Date(start); date.toISOString().slice(0, 10) <= today; date.setUTCDate(date.getUTCDate() + 1)) {
    daily.set(date.toISOString().slice(0, 10), 0);
  }
  const total: Totals = { views: 0, seconds: 0, orders: 0, phones: 0, directions: 0 };
  let unavailable = false;
  try {
    const db = await getAdminFirestore();
    if (!db) throw new Error("Statistics storage unavailable");
    const snapshot = await db.collection("siteStatistics").where("day", ">=", start.toISOString().slice(0, 10)).get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const row = pages.get(data.path) ?? { views: 0, seconds: 0, orders: 0, phones: 0, directions: 0 };
      if (!daily.has(data.day)) continue;
      daily.set(data.day, daily.get(data.day)! + Number(data.views ?? 0));
      for (const key of Object.keys(row) as (keyof Totals)[]) {
        const value = Number(data[key] ?? 0);
        row[key] += value;
        total[key] += value;
      }
      pages.set(data.path, row);
    }
  } catch {
    unavailable = true;
  }
  const ranked = Array.from(pages).sort((a, b) => b[1].views - a[1].views);
  return <section className="admin-card" dir="rtl">
    <h1>סטטיסטיקה</h1>
    <p>פעילות של גולשים שאישרו מדידה, לפי שעון ישראל.</p>
    <nav aria-label="תקופת הדוח">{[1, 7, 30].map(n => <Link key={n} className="admin-button" href={`/admin/statistics?days=${n}`} aria-current={days === n ? "page" : undefined} style={{ fontWeight: days === n ? 800 : 400 }}>{n === 1 ? "היום" : n + " ימים"}</Link>)}</nav>
    {unavailable ? <p>נתוני הסטטיסטיקה אינם זמינים כרגע.</p> : pages.size === 0 ? <p>טרם נמדדה פעילות בתקופה זו.</p> :
      <>
      <dl style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {[
          ["צפיות", total.views.toLocaleString("he-IL")],
          ["עמודים שנצפו", ranked.filter(([, row]) => row.views > 0).length],
          ["זמן גלישה מצטבר בדקות", (total.seconds / 60).toFixed(1)],
          ["שניות בממוצע לצפייה", total.views ? Math.round(total.seconds / total.views) : "—"]
        ].map(([label, value]) => <div className="admin-card" key={label}><dt>{label}</dt><dd style={{ margin: 0, fontSize: "1.5rem" }}>{value}</dd></div>)}
      </dl>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 270px), 1fr))", gap: 16, alignItems: "start" }}>
        <BarChart title="צפיות לפי יום" rows={Array.from(daily, ([day, value]) => ({ label: day.slice(5).split("-").reverse().join("/"), value }))} />
        <BarChart title="העמודים הנצפים ביותר" rows={ranked.filter(([, row]) => row.views > 0).slice(0, 5).map(([path, row]) => ({ label: path === "/" ? "דף הבית" : path, value: row.views }))} />
        <BarChart title="לחיצות לפי פעולה" rows={[{ label: "הזמנה", value: total.orders }, { label: "טלפון", value: total.phones }, { label: "מיקום", value: total.directions }]} />
      </div>
      <div style={{ overflowX: "auto" }}><table className="admin-table">
        <caption>פעילות לפי עמוד · {start.toISOString().slice(0, 10)} – {today}</caption>
        <thead><tr>{["עמוד", "צפיות", "זמן גלישה מצטבר (דק׳)", "לחיצות להזמנה", "לחיצות לטלפון", "לחיצות למיקום"].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>{ranked.map(([path, row]) =>
          <tr key={path}><th scope="row"><Link href={path} dir="ltr">{path === "/" ? "דף הבית" : path}</Link></th><td>{row.views}</td><td>{(row.seconds / 60).toFixed(1)}</td><td>{row.orders}</td><td>{row.phones}</td><td>{row.directions}</td></tr>)}</tbody>
      </table></div></>}
  </section>;
}
