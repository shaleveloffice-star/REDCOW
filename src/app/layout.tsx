import type { Metadata } from "next";
import { Assistant, Barlow_Condensed } from "next/font/google";
import "./globals.css";

import { LocaleProvider } from "@/components/providers/locale-provider";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { getDirection } from "@/i18n/config";
import { getServerLocale } from "@/i18n/get-locale";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-assistant",
  display: "swap"
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap"
});

const DEFAULT_DESCRIPTION =
  "מסעדת המבורגרים NB BURGER ברעננה — המבורגרים על הפלנצ׳ה, אווירה וטעם מדויק.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} | המבורגר רעננה`,
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
    shortcut: ["/favicon.ico"]
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "he_IL",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE]
  }
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
      <body className={`${assistant.variable} ${barlowCondensed.variable} ${assistant.className}`}>
        <LocaleProvider initialLocale={locale}>
          <SkipToContent />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
