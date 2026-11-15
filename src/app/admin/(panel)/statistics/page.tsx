import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdminSession } from "@/lib/auth/get-current-admin-session";
import { getAdminFirestore } from "@/lib/firebase/admin-firestore";

type Totals = { views: number; seconds: number; orders: number; phones: number; directions: number };
type Bar = { label: string; value: number };

function TrendChart({ title, rows }: { title: string; rows: Bar[] }) {
  const max = Math.max(1, ...rows.map(row => row.value));
  const points = rows.map(({ value }, i) => {
    const x = rows.length === 1 ? 160 : 8 + 304 * i / (rows.length - 1);
    return [x, 100 - 90 * value / max];
  });
  return <section className="admin-card">
    <h2>{title}</h2>
    <svg viewBox="0 0 320 108" role="img" aria-label={title} style={{ width: "100%" }}>
      <path d="M8 100H312" stroke="#bcc4d4" />
      <polyline points={points.map(point => point.join(",")).join(" ")} fill="none" stroke="#465cb2" strokeWidth="2.5" />
      {points.length === 1 && <circle cx={points[0][0]} cy={points[0][1]} r="4" fill="#465cb2" />}
    </svg>
    <div dir="ltr" style={{ display: "flex", justifyContent: "space-between" }}><span>{rows[0].label}</span><span>{rows.at(-1)?.label}</span></div>
    <details><summary>ערכים בתרשים</summary><ul>{rows.map(row => <li key={row.label}><bdi>{row.label}</bdi> · {row.value} צפיות</li>)}</ul></details>
  </section>;
}

function BarChart({ title, rows }: { title: string; rows: Bar[] }) {
  const maximum = Math.max(1, ...rows.map(row => row.value));
  return <section className="admin-card">
    <h2>{title}</h2>
    <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8, maxHeight: "26rem", overflowY: "auto" }}>
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
export default async function StatisticsPage({ searchParams }: { searchParams: Promise<{ days?: string; from?: string; to?: string }> }) {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");
  const { days: preset, from, to } = await searchParams;
  const custom = from !== undefined || to !== undefined;
  const requested = Number(preset);
  const days = [1, 7, 30].includes(requested) ? requested : 7;
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jerusalem" }).format(new Date());
  const start = new Date(today + "T12:00:00Z");
  start.setUTCDate(start.getUTCDate() - days + 1);
  const first = custom ? from ?? "" : start.toISOString().slice(0, 10);
  const last = custom ? to ?? "" : today;
  const validDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day) && new Date(day + "T12:00:00Z").toJSON()?.slice(0, 10) === day;
  const valid = validDay(first) && validDay(last) && first <= last && last <= today && first >= "2020-01-01";
  const pages = new Map<string, Totals>();
  const daily = new Map<string, { views: number; orders: number; seconds: number }>();
  for (const date = new Date(first + "T12:00:00Z"); valid && date.toISOString().slice(0, 10) <= last; date.setUTCDate(date.getUTCDate() + 1)) {
    daily.set(date.toISOString().slice(0, 10), { views: 0, orders: 0, seconds: 0 });
  }
  const total: Totals = { views: 0, seconds: 0, orders: 0, phones: 0, directions: 0 };
  const hours = Array.from({ length: 24 }, (_, hour) => ({
    label: String(hour).padStart(2, "0") + ":00", value: 0
  }));
  let unavailable = false;
  if (valid) try {
    const db = await getAdminFirestore();
    if (!db) throw new Error("Statistics storage unavailable");
    const snapshot = await db.collection("siteStatistics").where("day", ">=", first).where("day", "<=", last).get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const row = pages.get(data.path) ?? { views: 0, seconds: 0, orders: 0, phones: 0, directions: 0 };
      const day = daily.get(data.day);
      if (!day) continue;
      for (const [hour, count] of Object.entries(data.hourlyViews ?? {})) {
        if (/^(?:[01]\d|2[0-3])$/.test(hour) && typeof count === "number") hours[Number(hour)].value += count;
      }
      day.views += Number(data.views ?? 0);
      day.orders += Number(data.orders ?? 0);
      day.seconds += Number(data.seconds ?? 0);
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
    <nav aria-label="תקופת הדוח">{[1, 7, 30].map(n => <Link key={n} className="admin-button" href={`/admin/statistics?days=${n}`} aria-current={!custom && days === n ? "page" : undefined} style={{ fontWeight: !custom && days === n ? 800 : 400 }}>{n === 1 ? "היום" : n + " ימים"}</Link>)}</nav>
    <form key={first + last} method="get" style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 12, marginBlock: 16 }}>
      <label>מתאריך <input required type="date" name="from" min="2020-01-01" max={today} defaultValue={first} /></label>
      <label>עד תאריך <input required type="date" name="to" min="2020-01-01" max={today} defaultValue={last} /></label>
      <button className="admin-button" type="submit">הצגת התקופה</button>
    </form>
    {!valid ? <p role="alert">בחרו שני תאריכים בסדר כרונולוגי, עד היום.</p> : unavailable ? <p>נתוני הסטטיסטיקה אינם זמינים כרגע.</p> : pages.size === 0 ? <p>טרם נמדדה פעילות בתקופה זו.</p> :
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
        <TrendChart title="מגמת צפיות יומית" rows={Array.from(daily, ([day, data]) => ({ label: day.split("-").reverse().join("/"), value: data.views }))} />
        <div>{hours.some(hour => hour.value > 0) && <TrendChart title="צפיות לפי שעה ביום" rows={hours} />}
          <p>{hours.reduce((sum, hour) => sum + hour.value, 0)} מתוך {total.views} צפיות בתקופה כוללות שעת צפייה.</p>
        </div>
        <BarChart title="לחיצות להזמנה לפי יום" rows={Array.from(daily, ([day, data]) => ({ label: day.split("-").reverse().join("/"), value: data.orders }))} />
        <BarChart title="זמן גלישה לפי יום (דקות)" rows={Array.from(daily, ([day, data]) => ({ label: day.split("-").reverse().join("/"), value: Number((data.seconds / 60).toFixed(1)) }))} />
        <BarChart title="העמודים הנצפים ביותר" rows={ranked.filter(([, row]) => row.views > 0).slice(0, 5).map(([path, row]) => ({ label: path === "/" ? "דף הבית" : path, value: row.views }))} />
        <BarChart title="לחיצות לפי פעולה" rows={[{ label: "הזמנה", value: total.orders }, { label: "טלפון", value: total.phones }, { label: "מיקום", value: total.directions }]} />
      </div>
      <div style={{ overflowX: "auto" }}><table className="admin-table">
        <caption>פעילות לפי עמוד · {first} – {last}</caption>
        <thead><tr>{["עמוד", "צפיות", "זמן גלישה מצטבר (דק׳)", "לחיצות להזמנה", "לחיצות לטלפון", "לחיצות למיקום"].map(label => <th key={label}>{label}</th>)}</tr></thead>
        <tbody>{ranked.map(([path, row]) =>
          <tr key={path}><th scope="row"><Link href={path} dir="ltr">{path === "/" ? "דף הבית" : path}</Link></th><td>{row.views}</td><td>{(row.seconds / 60).toFixed(1)}</td><td>{row.orders}</td><td>{row.phones}</td><td>{row.directions}</td></tr>)}</tbody>
      </table></div></>}
  </section>;
}
