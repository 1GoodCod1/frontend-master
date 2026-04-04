import { prefsCookies } from '@/utils/prefsCookies';
import { safeStorage } from '@/utils/safeStorage';

export type AppLanguage = 'en' | 'ru' | 'ro';

export const STORAGE_KEY = 'faber_lang';

function getStorageItem(key: string): string | null {
  return safeStorage.getItem(key);
}

export function setStorageItem(key: string, value: string): void {
  safeStorage.setItem(key, value);
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

/** Deep-merge multiple translation slices into one. */
export function mergeTranslationSlices<T extends Record<string, unknown>>(
  ...slices: Partial<T>[]
): T {
  const result: Record<string, unknown> = {};
  for (const slice of slices) {
    for (const [key, value] of Object.entries(slice)) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        result[key] !== null &&
        typeof result[key] === 'object' &&
        !Array.isArray(result[key])
      ) {
        result[key] = mergeTranslationSlices(
          result[key] as Record<string, unknown>,
          value as Record<string, unknown>,
        );
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}
