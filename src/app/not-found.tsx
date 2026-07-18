import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main
      id="main-content"
      style={{
        minHeight: "60vh",
        display: "grid",
        placeContent: "center",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "1.5rem", margin: 0 }}>העמוד לא נמצא</h1>
      <p style={{ margin: 0, opacity: 0.8 }}>ייתכן שהכתובת השתנתה או שהקישור אינו תקין.</p>
      <Link className="button" href="/">
        חזרה לדף הבית
      </Link>
    </main>
  );
}
