
import { useState, useCallback, useMemo } from 'react';
import { translations } from '../lib/locales/index.ts';
import { SUPPORTED_LANGUAGES } from '../constants.ts';
import type { Language } from '../types.ts';

export const useLocalization = () => {
  const [language, setLanguage] = useState<string>(() => {
    try {
      const savedLang = window.localStorage.getItem('owfn-lang');
      if (savedLang && SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
        return savedLang;
      }
    } catch (error) {
      console.warn("Could not read language from localStorage", error);
    }
    return 'en';
  });

  const setLang = useCallback((langCode: string) => {
    if (SUPPORTED_LANGUAGES.some(l => l.code === langCode)) {
      try {
        window.localStorage.setItem('owfn-lang', langCode);
      } catch (error) {
        console.warn("Could not save language to localStorage", error);
      }
      setLanguage(langCode);
    }
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
    let translation = translations[language]?.[key] || translations['en']?.[key] || key;
    if (translation && replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(`{${placeholder}}`, String(value));
      });
    }
    return translation || key;
  }, [language]);

  const currentLanguage = useMemo(() => SUPPORTED_LANGUAGES.find(l => l.code === language) as Language, [language]);

  const value = useMemo(() => ({
    t,
    setLang,
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES
  }), [t, setLang, currentLanguage]);

  return value;
};
