"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[AppError]", error.digest ?? error.message);
  }, [error]);

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
      <h1 style={{ fontSize: "1.5rem", margin: 0 }}>משהו השתבש</h1>
      <p style={{ margin: 0, opacity: 0.8 }}>לא הצלחנו לטעון את העמוד. אפשר לנסות שוב.</p>
      <button className="button" type="button" onClick={reset}>
        נסו שוב
      </button>
    </main>
  );
}
