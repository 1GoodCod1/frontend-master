import { safeStorage } from '@/utils/safeStorage';

const KEY = 'mh_cookie_consent';

const NON_ESSENTIAL_KEYS = [
  'mastersSearchHistory',
  'mh_session_id',
  'userCityName',
] as const;

export type CookieConsentChoice = 'all' | 'necessary';

export function getCookieConsent(): CookieConsentChoice | null {
  const v = safeStorage.getItem(KEY);
  if (v === 'all' || v === 'necessary') return v;
  return null;
}

export function setCookieConsent(choice: CookieConsentChoice): void {
  safeStorage.setItem(KEY, choice);
}

export function hasConsent(): boolean {
  return getCookieConsent() !== null;
}

export function hasFullConsent(): boolean {
  return getCookieConsent() === 'all';
}

export function resetCookieConsent(): void {
  for (const key of NON_ESSENTIAL_KEYS) {
    safeStorage.removeItem(key);
  }
  safeStorage.removeItem(KEY);
}
