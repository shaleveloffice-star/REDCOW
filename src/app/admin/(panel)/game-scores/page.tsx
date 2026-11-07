import { requireAdminRole } from "@/lib/auth/admin-guard";
import { AdminCard } from "@/components/features/admin/admin-card";
import { AdminGameReset } from "@/components/features/admin/admin-game-reset";
import { deleteBurgerScoreAction, getAdminBurgerScores } from "@/server/actions/burger-game.actions";
export default async function GameScoresPage() {
  await requireAdminRole(["owner", "manager"]);
  const rows = await getAdminBurgerScores();
  return <AdminCard title="משחק — שיאים ופרטי קשר" description="כל התוצאות שנשמרו, מהניקוד הגבוה לנמוך. הטלפונים מוצגים רק כאן לבעלים ולמנהלים. כל מי שמגיע ל-1,250 נקודות ומעלה זכאי לארוחה.">
    <p>מספרי הטלפון נמסרו על ידי המשתתפים ולא אומתו ב־SMS. ברשומות ישנות לא נשמר טלפון.</p>
    <AdminGameReset />
    <div style={{ overflowX: "auto" }}><table className="table"><thead><tr><th>שם</th><th>ניקוד</th><th>זכאות לארוחה</th><th>טלפון — פרטי</th><th>נשמר בתאריך</th><th>פעולות</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{row.name}</td><td>{row.score}</td><td>{row.score >= 1250 ? "זכאי/ת" : "—"}</td><td dir="ltr">{row.phone ? <a href={`tel:${row.phone}`}>{row.phone}</a> : "לא נמסר"}</td><td>{row.createdAt ? new Date(row.createdAt).toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }) : "—"}</td><td><form action={deleteBurgerScoreAction}><input type="hidden" name="id" value={row.id}/><button type="submit">הסר מהטבלה ופרטי הקשר</button></form></td></tr>)}</tbody></table></div>
  </AdminCard>;
}
