"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { getBurgerLeaderboard } from "@/server/actions/burger-game.actions";
import styles from "./burger-game.module.css";
const Game = dynamic(() => import("./burger-game-play"), { ssr: false, loading: () => <p role="status">טוענים את המשחק…</p> });
export function BurgerGameSection() {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<Awaited<ReturnType<typeof getBurgerLeaderboard>>>([]);
  const [expanded, setExpanded] = useState(false);
  const [boardStatus, setBoardStatus] = useState("טוענים את טבלת השיאים…");
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let active = true;
    let pending = false;
    async function refreshLeader() {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const rows = await getBurgerLeaderboard();
        if (active) { setScores(rows); setBoardStatus(""); }
      } catch {
        if (active) setBoardStatus("לא ניתן לעדכן את טבלת השיאים כרגע. ננסה שוב בקרוב.");
      } finally { pending = false; }
    }
    void refreshLeader();
    const timer = window.setInterval(refreshLeader, 30_000);
    document.addEventListener("visibilitychange", refreshLeader);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshLeader);
    };
  }, [open]);
  return <section className={styles.section} aria-labelledby="burger-game-title" dir="rtl">
    <h2 id="burger-game-title">מגיעים ל-1,250 נקודות וזוכים בארוחה!</h2>
    <p>כל מי שמגיע ל-1,250 נקודות ומעלה במשחק מקבל מאיתנו ארוחה על חשבון הבית!</p>

    <p>יש לכם את זה?</p>
    <button ref={trigger} type="button" className={styles.button} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>יאללה, בואו לשחק! 🎮</button>
    <div className={styles.miniLeaderboard}>
      <h3>טבלת השיאים</h3>
      {scores.length ? <table id="home-game-leaderboard" className={styles.table}>
        <thead><tr><th scope="col">שם</th><th scope="col">ניקוד</th></tr></thead>
        <tbody>{scores.slice(0, expanded ? scores.length : 3).map(row => <tr key={row.id}><td><bdi>{row.name}</bdi></td><td>{row.score}</td></tr>)}</tbody>
      </table> : !boardStatus ? <p>מי יקבע את השיא הראשון?</p> : null}
      {boardStatus ? <p role="status">{boardStatus}</p> : null}
      {scores.length > 3 ? <button type="button" className={styles.tableToggle} aria-expanded={expanded} aria-controls="home-game-leaderboard" onClick={() => setExpanded(value => !value)}>{expanded ? "הצג רק את שלושת המובילים" : "לכל טבלת השיאים"}</button> : null}
    </div>
    {open ? <Game trigger={trigger.current} onClose={() => setOpen(false)} /> : null}
  </section>;
}
