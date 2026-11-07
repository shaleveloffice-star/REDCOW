import { requireAdminRole } from "@/lib/auth/admin-guard";
import { AdminCard } from "@/components/features/admin/admin-card";
import { deleteBurgerScoreAction, getBurgerLeaderboard } from "@/server/actions/burger-game.actions";
export default async function GameScoresPage() {
  await requireAdminRole(["owner", "manager"]);
  const rows = await getBurgerLeaderboard();
  return <AdminCard title="שיאי המשחק" description="עשרת השיאים המוצגים באתר. אפשר להסיר שמות לא ראויים מהטבלה.">
    <table className="table"><thead><tr><th>שם</th><th>ניקוד</th><th>פעולות</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{row.name}</td><td>{row.score}</td><td><form action={deleteBurgerScoreAction}><input type="hidden" name="id" value={row.id}/><button type="submit">הסר מהטבלה</button></form></td></tr>)}</tbody></table>
  </AdminCard>;
}
