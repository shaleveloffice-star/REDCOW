"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { mountModal } from "@/lib/a11y/focus-trap";
import { GAME_FPS, newBurgerGame, stepBurgerGame, type BurgerGame } from "@/lib/game/burger-game";
import { getBurgerLeaderboard, saveBurgerScoreAction, startBurgerGameAction } from "@/server/actions/burger-game.actions";
import styles from "./burger-game.module.css";

// Draw our own burger: bun, beef and vegetables only — no cheese or platform emoji.
function draw(ctx: CanvasRenderingContext2D, game: BurgerGame, basket: number) {
  ctx.clearRect(0, 0, 400, 500);
  for (const item of game.burgers) {
    const x = item.x * .4, y = item.y * .5;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = "#c9792b"; ctx.beginPath(); ctx.ellipse(0, -7, 17, 11, 0, Math.PI, 2*Math.PI); ctx.fill();
    ctx.fillStyle = "#fff0bd"; ctx.fillRect(-8,-14,2,2); ctx.fillRect(3,-15,2,2);
    ctx.fillStyle = "#47913a"; ctx.fillRect(-17,-6,34,4);
    ctx.fillStyle = "#c94532"; ctx.fillRect(-15,-2,30,3);
    ctx.fillStyle = "#60331f"; ctx.beginPath(); ctx.roundRect(-17,1,34,8,4); ctx.fill();
    ctx.fillStyle = "#c9792b"; ctx.beginPath(); ctx.roundRect(-16,10,32,6,3); ctx.fill(); ctx.restore();
  }
  const x = basket * .4;
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(x-40,446); ctx.lineTo(x+40,446); ctx.lineTo(x+31,478); ctx.lineTo(x-31,478); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
  for(let i=-24;i<=24;i+=12){ctx.beginPath();ctx.moveTo(x+i,451);ctx.lineTo(x+i,473);ctx.stroke();}
}

export default function BurgerGamePlay({ trigger, onClose }: { trigger: HTMLElement | null; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null), dialog = useRef<HTMLDivElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useLayoutEffect(() => {
    if (root.current && dialog.current) return mountModal(root.current, dialog.current, () => close.current(), trigger);
  }, [trigger]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef(newBurgerGame(1));
  const basket = useRef(500), moves = useRef<number[]>([]), session = useRef("");
  const keys = useRef({ left:false, right:false });
  const [phase, setPhase] = useState<"idle"|"loading"|"playing"|"over">("idle");
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({ score:0, misses:0 });
  const [rows, setRows] = useState<Awaited<ReturnType<typeof getBurgerLeaderboard>>>([]);
  const [message, setMessage] = useState("");
  const [boardError, setBoardError] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false);
  async function refresh() { try { setRows(await getBurgerLeaderboard()); setBoardError(""); } catch { setBoardError("טבלת השיאים אינה זמינה כרגע"); } }
  useEffect(() => { void refresh(); }, []);
  useEffect(() => {
    if (phase === "playing") canvas.current?.focus();
    if (phase === "over") resultHeading.current?.focus();
  }, [phase]);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (ctx) draw(ctx, game.current, basket.current);
    if (phase !== "playing" || paused) return;
    let frame = 0, previous = 0, elapsed = 0;
    const animate = (now: number) => {
      elapsed += previous ? Math.min(now-previous,100) : 0; previous = now;
      while(elapsed >= 1000/GAME_FPS && !game.current.over) {
        elapsed -= 1000/GAME_FPS;
        basket.current = Math.max(100,Math.min(900,basket.current + (Number(keys.current.right)-Number(keys.current.left))*22));
        moves.current.push(basket.current);
        stepBurgerGame(game.current,basket.current);
      }
      if(ctx) draw(ctx,game.current,basket.current);
      setStats(current => current.score === game.current.score && current.misses === game.current.misses ? current : {score:game.current.score,misses:game.current.misses});
      if(game.current.over) {setPhase("over"); return;}
      frame = requestAnimationFrame(animate);
    };
    frame=requestAnimationFrame(animate);
    const hide=()=>{if(document.hidden){setPaused(true);keys.current={left:false,right:false};}};
    document.addEventListener("visibilitychange",hide);
    return ()=>{cancelAnimationFrame(frame);document.removeEventListener("visibilitychange",hide);};
  },[phase,paused]);
  async function start() {
    setPhase("loading");setMessage("");
    const result=await startBurgerGameAction().catch(()=>({ok:false as const,error:"לא ניתן להתחיל כרגע. נסו שוב"}));
    if(!result.ok){setMessage(result.error);setPhase("idle");return;}
    session.current=result.id;game.current=newBurgerGame(result.seed);basket.current=500;moves.current=[];keys.current={left:false,right:false};
    setStats({score:0,misses:0});setSaved(false);setPaused(false);setPhase("playing");canvas.current?.focus();
  }
  return createPortal(<div ref={root} className={styles.backdrop} dir="rtl">
    <div ref={dialog} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="burger-game-dialog-title" tabIndex={-1}>
    <header className={styles.header}>
      <h2 id="burger-game-dialog-title">תופסים ביס</h2>
      <button type="button" className={styles.close} onClick={onClose} aria-label="סגירת המשחק">×</button>
      <div className={styles.stats}><strong>ניקוד: {stats.score}</strong><span>פסילות: {Math.min(stats.misses,3)} / 3</span></div>
    </header>
    <div className={styles.shell}>
    {phase !== "over" ? <>
    {phase !== "playing" ? <p>גררו את הסל באצבע או הזיזו את העכבר. במקלדת: חצים ימינה ושמאלה. כל תפיסה = 10 נקודות. 3 פסילות או 90 שניות מסיימות את המשחק.</p> : null}
    <canvas ref={canvas} className={styles.board} width={400} height={500} tabIndex={0} aria-label="משחק תפיסת המבורגרים. השתמשו בחצים כדי להזיז את הסל."
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);canvas.current?.focus();const r=e.currentTarget.getBoundingClientRect();basket.current=Math.round(Math.max(100,Math.min(900,(e.clientX-r.left)/r.width*1000)));}}
      onPointerMove={e=>{if(e.pointerType!=="mouse"&&!e.currentTarget.hasPointerCapture(e.pointerId))return;const r=e.currentTarget.getBoundingClientRect();basket.current=Math.round(Math.max(100,Math.min(900,(e.clientX-r.left)/r.width*1000)));}}
      onKeyDown={e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();keys.current[e.key==="ArrowLeft"?"left":"right"]=true;}}}
      onKeyUp={e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();keys.current[e.key==="ArrowLeft"?"left":"right"]=false;}}}
      onBlur={()=>{keys.current={left:false,right:false};if(phase==="playing")setPaused(true);}} />
    </> : null}
    {phase === "over" ? <div className={styles.results}>
      <h3 ref={resultHeading} tabIndex={-1}>המשחק הסתיים!</h3>
      <p className={styles.finalScore}>{stats.score} נקודות</p>
      {!saved && stats.score>0 ? <form className={styles.form} onSubmit={async e=>{
        e.preventDefault();setSaving(true);setMessage("");
        try {const result=await saveBurgerScoreAction(session.current,name,moves.current);if(result.ok){setSaved(true);setMessage("השיא נשמר! הטבלה מציגה את עשרת השיאים הגבוהים ביותר.");await refresh();}else setMessage(result.error);}
        catch{setMessage("השמירה נכשלה. נסו שוב");}finally{setSaving(false);}
      }}><label>כינוי לטבלת השיאים<input value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={20} required autoComplete="off" /></label><button className={styles.button} disabled={saving}>{saving?"שומרים…":"שמור שיא"}</button><p>הכינוי והניקוד יופיעו בפומבי. בחרו כינוי ללא פרטים אישיים.</p></form>:null}</div>:null}
    <p role="status" className={styles.notice}>{message}</p>
    <div className={styles.actions}>
      {phase!=="playing" ? <button className={styles.button} disabled={phase==="loading"||saving} onClick={start}>{phase==="loading"?"מתכוננים…":phase==="over"?"שחקו שוב":"מתחילים"}</button> : <button className={styles.button} onClick={()=>{setPaused(!paused);canvas.current?.focus();}}>{paused?"המשך משחק":"השהיה"}</button>}
    </div>
    {phase !== "playing" ? <>
    <h3>טבלת השיאים</h3>
    {boardError?<p role="status">{boardError}</p>:<table className={styles.table}><thead><tr><th>מקום</th><th>שם</th><th>ניקוד</th></tr></thead><tbody>{rows.map((row,index)=><tr key={row.id}><td>{index+1}</td><td>{row.name}</td><td>{row.score}</td></tr>)}{!rows.length?<tr><td colSpan={3}>מי יקבע את השיא הראשון?</td></tr>:null}</tbody></table>}
    </> : null}
    </div></div>
  </div>, document.body);
}
