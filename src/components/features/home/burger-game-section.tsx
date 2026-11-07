"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { getBurgerLeaderboard } from "@/server/actions/burger-game.actions";
import styles from "./burger-game.module.css";
const Game = dynamic(() => import("./burger-game-play"), { ssr: false, loading: () => <p role="status">טוענים את המשחק…</p> });
export function BurgerGameSection() {
  const [open, setOpen] = useState(false);
  const [leader, setLeader] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let active = true;
    let pending = false;
    async function refreshLeader() {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const rows = await getBurgerLeaderboard();
        if (active) setLeader(rows[0]?.name || null);
      } catch {
        if (active) setLeader(null);
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
    <h2 id="burger-game-title">{leader ? <>חושבים שאתם יותר טובים מ<bdi>{leader}</bdi>?</> : "חושבים שאתם יכולים לשבור את השיא?"} 🍔🔥</h2>
    <p>ב־1 וב־15 בכל חודש, מי שמוביל בטבלת השיאים במועד חלוקת הפרס מקבל מאיתנו ארוחה על חשבון הבית!</p>
    <p>שמרו את השיא עם כינוי ומספר טלפון כדי שנוכל ליצור איתכם קשר. רק הכינוי והניקוד יוצגו באתר.</p>
    <p>יש לכם את זה?</p>
    <button ref={trigger} type="button" className={styles.button} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>יאללה, בואו לשחק! 🎮</button>
    {open ? <Game trigger={trigger.current} onClose={() => setOpen(false)} /> : null}
  </section>;
}
