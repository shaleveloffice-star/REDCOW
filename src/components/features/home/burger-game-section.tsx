"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import styles from "./burger-game.module.css";
const Game = dynamic(() => import("./burger-game-play"), { ssr: false, loading: () => <p role="status">טוענים את המשחק…</p> });
export function BurgerGameSection() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return <section className={styles.section} aria-labelledby="burger-game-title" dir="rtl">
    <h2 id="burger-game-title">חושבים שאתם יותר טובים מספיר? 🍔🔥</h2>
    <p>מי שעוקף את השיא של ספיר מקבל מאיתנו ארוחה על חשבון הבית!</p>
    <p>יש לכם את זה?</p>
    <button ref={trigger} type="button" className={styles.button} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>יאללה, בואו לשחק! 🎮</button>
    {open ? <Game trigger={trigger.current} onClose={() => setOpen(false)} /> : null}
  </section>;
}
