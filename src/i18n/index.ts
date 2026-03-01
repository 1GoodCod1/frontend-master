import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations';
import {
  type AppLanguage,
  STORAGE_KEY,
  getInitialLanguage,
  persistLanguage,
} from './utils';

export type { AppLanguage };
export { STORAGE_KEY };

export function setLanguage(lang: AppLanguage) {
  if (!['en', 'ru', 'ro'].includes(lang)) return;
  i18n.changeLanguage(lang);
  persistLanguage(lang);
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'ro',
  interpolation: { escapeValue: false },
});

export { getInitialLanguage };
export default i18n;
