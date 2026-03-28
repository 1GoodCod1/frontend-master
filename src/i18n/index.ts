import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { buildCoreResources } from './translations/core';
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
  resources: buildCoreResources(),
  lng: getInitialLanguage(),
  fallbackLng: 'ro',
  interpolation: { escapeValue: false },
});

/** Подгружает остальные переводы отдельным чанком и мержит в `translation`. Вызывать до первого рендера. */
export async function loadExtendedTranslations(): Promise<void> {
  const { buildExtendedResources } = await import('./translations/extended');
  const ext = buildExtendedResources();
  for (const lng of ['en', 'ru', 'ro'] as const) {
    i18n.addResourceBundle(lng, 'translation', ext[lng].translation, true, true);
  }
}

export { getInitialLanguage };
export default i18n;
