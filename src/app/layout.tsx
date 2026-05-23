import type { Metadata } from "next";
import { Assistant, Heebo } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-assistant",
  display: "swap"
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["100", "200", "300"],
  variable: "--font-heebo",
  display: "swap"
});

export const metadata: Metadata = {
  title: "NB Burger",
  description: "NB Burger restaurant website with a local Firebase-ready architecture."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${assistant.variable} ${heebo.variable}`}>{children}</body>
    </html>
  );
}
