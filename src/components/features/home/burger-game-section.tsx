"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import styles from "./burger-game.module.css";
const Game = dynamic(() => import("./burger-game-play"), { ssr: false, loading: () => <p role="status">טוענים את המשחק…</p> });
export function BurgerGameSection() {
  const [open, setOpen] = useState(false);
  return <section className={styles.section} aria-labelledby="burger-game-title" dir="rtl">
    <h2 id="burger-game-title">תופסים ביס. שוברים שיא.</h2>
    <p>מזיזים את הסל, תופסים המבורגרים וצוברים נקודות. הקצב עולה — מצליחים לעמוד בו?</p>
    <button type="button" className={styles.button} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "סגירת המשחק" : "בואו לשחק"}</button>
    {open ? <Game /> : null}
  </section>;
}
