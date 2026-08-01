import Link from "next/link";

import { getServerLocale } from "@/i18n/get-locale";
import { getMessages } from "@/i18n/messages";

export default async function NotFoundPage() {
  const locale = await getServerLocale();
  const t = getMessages(locale);

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
      <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{t.notFound.title}</h1>
      <p style={{ margin: 0, opacity: 0.8 }}>{t.notFound.description}</p>
      <Link className="button" href="/">
        {t.notFound.backHome}
      </Link>
    </main>
  );
}
