import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "אודות | Red Cow"
};

export default function AboutPage() {
  return (
    <main className="page-shell section">
      <h1 className="section-title">אודות</h1>
    </main>
  );
}
