"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getDirection, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  initialLocale: Locale;
  initialMessages: Messages;
  children: ReactNode;
};

export function LocaleProvider({ initialLocale, initialMessages, children }: LocaleProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Messages>(initialMessages);

  useEffect(() => {
    setLocaleState(initialLocale);
    setMessages(initialMessages);
  }, [initialLocale, initialMessages]);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) {
        return;
      }

      const secure =
        typeof window !== "undefined" && window.location.protocol === "https:" ? ";Secure" : "";
      document.cookie = `${LOCALE_COOKIE}=${nextLocale};path=/;max-age=31536000;SameSite=Lax${secure}`;
      document.documentElement.lang = nextLocale;
      document.documentElement.dir = getDirection(nextLocale);
      setLocaleState(nextLocale);
      router.refresh();
    },
    [locale, router]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      messages,
      setLocale
    }),
    [locale, messages, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export function useTranslations() {
  return useLocale().messages;
}
