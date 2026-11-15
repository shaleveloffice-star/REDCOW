import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin-firestore";
import { publicStatisticsPath } from "@/lib/site-statistics";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const input = await request.json().catch(() => null);
  if (!input || typeof input.path !== "string" || !publicStatisticsPath(input.path) ||
      !["views", "seconds", "orders", "phones", "directions"].includes(input.metric) ||
      !Number.isInteger(input.value) || input.value < 1 || input.value > (input.metric === "seconds" ? 86400 : 1)) {
    return new Response(null, { status: 400 });
  }
  const db = await getAdminFirestore();
  if (!db) return new Response(null, { status: 503 });
  const day = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jerusalem" }).format(new Date());
  const id = day + "_" + encodeURIComponent(input.path);
  await db.collection("siteStatistics").doc(id).set({
    day, path: input.path, [input.metric]: FieldValue.increment(input.value)
  }, { merge: true });
  return new Response(null, { status: 204 });
}
