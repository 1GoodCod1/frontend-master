import { prefsCookies } from '@/utils/prefsCookies';

export type AppLanguage = 'en' | 'ru' | 'ro';

export const STORAGE_KEY = 'mh_lang';

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(key);
  }
  return null;
}

export function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(key, value);
  }
}

function getLangFromCookie(): AppLanguage | null {
  if (typeof document === 'undefined') return null;
  try {
    const v = prefsCookies.lang.get();
    if (v && ['en', 'ru', 'ro'].includes(v)) return v as AppLanguage;
  } catch {
    //
  }
  return null;
}

export function getInitialLanguage(): AppLanguage {
  const fromCookie = getLangFromCookie();
  if (fromCookie) return fromCookie;
  const stored = getStorageItem(STORAGE_KEY) as AppLanguage | null;
  if (stored && ['en', 'ru', 'ro'].includes(stored)) {
    return stored;
  }
  return 'ro';
}

export function persistLanguage(lang: AppLanguage): void {
  if (!['en', 'ru', 'ro'].includes(lang)) return;
  try {
    setStorageItem(STORAGE_KEY, lang);
    prefsCookies.lang.set(lang);
  } catch {
    //
  }
}

/** Merge multiple translation slices into one. Keys must not overlap. */
export function mergeTranslationSlices<T extends Record<string, unknown>>(
  ...slices: Partial<T>[]
): T {
  return Object.assign({}, ...slices) as T;
}
