import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';

const STORAGE_KEY = 'kd-language';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

const syncHtmlLang = (lng: string): void => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lng);
  }
};
syncHtmlLang(i18n.language || 'en');
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
