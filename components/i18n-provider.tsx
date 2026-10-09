"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANGUAGES, translations, type Language, type TranslationKey } from "@/lib/i18n/translations";

type I18nContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey) => string };
const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "gemlocks:language";

function detectLanguage(): Language {
  const values = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const value of values) {
    const normalized = value.toLowerCase();
    if (normalized === "es-ar" || normalized.startsWith("es-ar-")) return "es-AR";
    if (normalized === "es" || normalized.startsWith("es-")) return "es";
    if (normalized === "en" || normalized.startsWith("en-")) return "en";
  }
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial = LANGUAGES.find((item) => item === stored) ?? detectLanguage();
    setLanguageState(initial);
    document.documentElement.lang = initial;
  }, []);
  const setLanguage = useCallback((next: Language) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setLanguageState(next);
    document.documentElement.lang = next;
    window.location.reload();
  }, []);
  const t = useCallback((key: TranslationKey) => translations[language][key] ?? translations.en[key], [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
