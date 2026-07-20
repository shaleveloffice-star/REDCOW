import type { Metadata } from "next";
import { Archivo_Black, Assistant } from "next/font/google";
import "./globals.css";
import "./homepage-ds.css";
import "./locations-page.css";
import "./menu-page.css";

import { SiteChrome } from "@/components/layout/site-chrome";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { getDirection } from "@/i18n/config";
import { getServerLocale } from "@/i18n/get-locale";
import { getCachedActiveOrderLinks } from "@/lib/cache/cached-data";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-assistant",
  display: "swap"
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
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
  const [locale, orderLinks] = await Promise.all([
    getServerLocale(),
    getCachedActiveOrderLinks()
  ]);
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir}>
      <body className={`${assistant.variable} ${archivoBlack.variable} ${assistant.className}`}>
        <LocaleProvider initialLocale={locale}>
          <SkipToContent />
          <SiteChrome orderLinks={orderLinks}>{children}</SiteChrome>
        </LocaleProvider>
      </body>
    </html>
  );
}
