import { createContext, useContext, useMemo, useState } from "react";
import { translations } from "./translations";

const LANGUAGE_STORAGE_KEY = "copi.language";

function detectBrowserLocale() {
  if (typeof navigator === "undefined") return "en";
  const language = (navigator.language || "en").toLowerCase();
  return language.startsWith("fr") ? "fr" : "en";
}

function getInitialLocale() {
  if (typeof window === "undefined") return "en";

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "fr" || stored === "en") return stored;

  return detectBrowserLocale();
}

function resolvePath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function interpolate(template, params = {}) {
  if (typeof template !== "string") return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => (params[key] !== undefined ? String(params[key]) : `{${key}}`));
}

const I18nContext = createContext({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  const setLocale = (next) => {
    if (next !== "fr" && next !== "en") return;
    setLocaleState(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  };

  const value = useMemo(() => {
    const t = (key, params = {}) => {
      const dictionary = translations[locale] ?? translations.en;
      const fallback = translations.en;
      const raw = resolvePath(dictionary, key) ?? resolvePath(fallback, key) ?? key;
      return interpolate(raw, params);
    };

    return { locale, setLocale, t };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
