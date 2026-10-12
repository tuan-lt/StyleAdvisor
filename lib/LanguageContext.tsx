"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, Translations, translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.en,
});

export const LANGUAGE_STORAGE_KEY = "style_advisor_lang";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (savedLang === "en" || savedLang === "fr") {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang === "fr" ? "fr-CA" : "en-CA";
      } else {
        // Detect browser language if available
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("fr")) {
          setLanguageState("fr");
          document.documentElement.lang = "fr-CA";
        }
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang === "fr" ? "fr-CA" : "en-CA";
    } catch {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fr" : "en");
  };

  const currentTranslations = translations[language] || translations.en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: currentTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
