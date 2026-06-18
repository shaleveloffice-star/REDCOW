import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";

import { LocaleProvider } from "@/components/providers/locale-provider";
import { getDirection } from "@/i18n/config";
import { getServerLocale } from "@/i18n/get-locale";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-assistant",
  display: "swap"
});

export const metadata: Metadata = {
  title: "NB Burger",
  description: "NB Burger restaurant website with a local Firebase-ready architecture."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir}>
      <body className={`${assistant.variable} ${assistant.className}`}>
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
