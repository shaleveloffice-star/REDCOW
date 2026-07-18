"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="he" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeContent: "center",
          gap: "1rem",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          background: "#000",
          color: "#fff",
          textAlign: "center"
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>שגיאת מערכת</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          אירעה שגיאה בלתי צפויה
          {error.digest ? ` (${error.digest})` : ""}.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            justifySelf: "center",
            padding: "0.75rem 1.25rem",
            border: "1px solid #ffe1ba",
            background: "#ffe1ba",
            color: "#000",
            cursor: "pointer"
          }}
        >
          נסו שוב
        </button>
      </body>
    </html>
  );
}
