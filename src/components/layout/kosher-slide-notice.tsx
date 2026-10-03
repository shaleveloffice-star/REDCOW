import styles from "./kosher-slide-notice.module.css";

/** Decorative reminder; the persistent banner already supplies the accessible kosher text. */
export function KosherSlideNotice() {
  return (
    <div className={styles.notice} dir="rtl" aria-hidden="true">
      <span className={styles.first}>כ</span>
      <span className={styles.second}>ש</span>
      <span className={styles.third}>ר</span>
    </div>
  );
}
