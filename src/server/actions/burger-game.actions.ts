"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase/admin-runtime";
import { consumeRateLimitAsync, getRequestClientIp } from "@/lib/security/rate-limit";
import { requireAdminRole } from "@/lib/auth/admin-guard";
import { revalidatePath } from "next/cache";
import { GAME_FPS, gameNickname, gamePhone, replayBurgerGame } from "@/lib/game/burger-game";

export async function getBurgerLeaderboard() {
  const db = await getAdminFirestore();
  if (!db) throw new Error("טבלת השיאים אינה זמינה כרגע");
  const snapshot = await db.collection("burgerGameScores").orderBy("score", "desc").limit(10).get();
  return snapshot.docs.map(doc => ({ id: doc.id, name: String(doc.get("name")), score: Number(doc.get("score")) }));
}

export async function startBurgerGameAction() {
  try {
    const ip = await getRequestClientIp();
    if (!await consumeRateLimitAsync(`burger-start:${ip}`, 30, 10 * 60_000)) throw new Error("אפשר להתחיל משחק נוסף בעוד כמה דקות");
    const db = await getAdminFirestore();
    if (!db) throw new Error("שמירת שיאים אינה זמינה כרגע. נסו שוב מאוחר יותר");
    const id = randomUUID(), seed = randomBytes(4).readUInt32LE(0);
    await db.collection("burgerGameSessions").doc(id).create({ seed, startedAt: Date.now(), used: false, expiresAt: new Date(Date.now() + 15 * 60_000) });
    return { ok: true as const, id, seed };
  } catch (error) { return { ok: false as const, error: error instanceof Error ? error.message : "לא ניתן להתחיל כרגע" }; }
}

export async function saveBurgerScoreAction(id: string, nickname: string, moves: number[], phoneInput: string) {
  try {
    const name = gameNickname(nickname);
    const phone = gamePhone(phoneInput);
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("משחק לא תקין");
    const ip = await getRequestClientIp();
    if (!await consumeRateLimitAsync(`burger-score:${ip}`, 20, 10 * 60_000)) throw new Error("נסו שוב בעוד כמה דקות");
    const db = await getAdminFirestore();
    if (!db) throw new Error("שמירת שיאים אינה זמינה כרגע");
    const session = db.collection("burgerGameSessions").doc(id);
    await db.runTransaction(async transaction => {
      const saved = await transaction.get(session);
      const data = saved.data();
      if (!data || data.used || Date.now() - data.startedAt > 15 * 60_000) throw new Error("המשחק כבר נשמר או שפג תוקפו");
      const game = replayBurgerGame(data.seed, moves);
      if (game.tick > (Date.now() - data.startedAt) * GAME_FPS / 1000 + GAME_FPS * 2) throw new Error("משך המשחק לא תקין");
      if (!game.score) throw new Error("צריך לתפוס לפחות המבורגר אחד כדי להיכנס לטבלה");
      transaction.create(db.collection("burgerGameScores").doc(id), { name, score: game.score, createdAt: new Date() });
      transaction.create(db.collection("burgerGameContacts").doc(id), { name, phone, score: game.score, createdAt: new Date() });
      transaction.update(session, { used: true });
    });
    return { ok: true as const };
  } catch (error) { return { ok: false as const, error: error instanceof Error ? error.message : "השמירה נכשלה" }; }
}

export async function getAdminBurgerScores() {
  await requireAdminRole(["owner", "manager"]);
  const db = await getAdminFirestore();
  if (!db) throw new Error("המערכת אינה זמינה");
  const snapshot = await db.collection("burgerGameScores").orderBy("score", "desc").get();
  const contacts = snapshot.docs.length ? await db.getAll(...snapshot.docs.map(doc => db.collection("burgerGameContacts").doc(doc.id))) : [];
  return snapshot.docs.map((doc, index) => ({
    id: doc.id, name: String(doc.get("name")), score: Number(doc.get("score")),
    phone: String(contacts[index]?.get("phone") || ""),
    createdAt: doc.get("createdAt")?.toDate?.().toISOString() as string | undefined
  }));
}

export async function deleteBurgerScoreAction(form: FormData) {
  await requireAdminRole(["owner", "manager"]);
  const id = String(form.get("id") || "");
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("מזהה לא תקין");
  const db = await getAdminFirestore();
  if (!db) throw new Error("המערכת אינה זמינה");
  const batch = db.batch();
  batch.delete(db.collection("burgerGameScores").doc(id));
  batch.delete(db.collection("burgerGameContacts").doc(id));
  await batch.commit();
  revalidatePath("/admin/game-scores");
}
