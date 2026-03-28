import { mergeTranslationSlices } from '../utils';
import { app } from './app';
import { nav } from './nav';
import { common } from './common';
import { notifications } from './notifications';
import { theme } from './theme';
import { cookieConsent } from './cookieConsent';
import { verificationBanner } from './verificationBanner';
import { home } from './home';
import { footer } from './footer';
import { loading } from './loading';

/** Минимум для оболочки и первого экрана — остаётся в основном бандле. */
const coreModules = [
  app,
  nav,
  common,
  notifications,
  theme,
  cookieConsent,
  verificationBanner,
  home,
  footer,
  loading,
];

export function buildCoreResources() {
  return {
    en: {
      translation: mergeTranslationSlices(
        ...coreModules.map((m) => m.en as Record<string, unknown>),
      ),
    },
    ru: {
      translation: mergeTranslationSlices(
        ...coreModules.map((m) => m.ru as Record<string, unknown>),
      ),
    },
    ro: {
      translation: mergeTranslationSlices(
        ...coreModules.map((m) => m.ro as Record<string, unknown>),
      ),
    },
  };
}
