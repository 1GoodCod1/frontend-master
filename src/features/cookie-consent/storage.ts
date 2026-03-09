import { safeStorage } from '@/utils/safeStorage';

const KEY = 'mh_cookie_consent';

export const NON_ESSENTIAL_KEYS = [
  'mastersSearchHistory',
  'mh_session_id',
  'userCityName',
] as const;

export type CookiePreferences = {
  searchHistory: boolean;
  session: boolean;
  city: boolean;
};

export const DEFAULT_PREFERENCES: CookiePreferences = {
  searchHistory: false,
  session: false,
  city: false,
};

export type CookieConsentChoice = 'all' | 'necessary';

type StoredConsent =
  | 'all'
  | 'necessary'
  | { mode: 'custom'; prefs: CookiePreferences };

function getStored(): StoredConsent | null {
  const v = safeStorage.getItem(KEY);
  if (!v) return null;
  if (v === 'all' || v === 'necessary') return v;
  try {
    const parsed = JSON.parse(v) as StoredConsent;
    if (parsed && typeof parsed === 'object' && parsed.mode === 'custom' && parsed.prefs)
      return parsed;
  } catch {
    //
  }
  return null;
}

export function getCookieConsent(): CookieConsentChoice | null {
  const s = getStored();
  if (!s) return null;
  if (s === 'all') return 'all';
  if (s === 'necessary') return 'necessary';
  return 'necessary'; // custom is a form of "necessary" with choices
}

export function getCookiePreferences(): CookiePreferences {
  const s = getStored();
  if (s === 'all') return { searchHistory: true, session: true, city: true };
  if (s === 'necessary') return DEFAULT_PREFERENCES;
  if (s && s.mode === 'custom') return s.prefs;
  return DEFAULT_PREFERENCES;
}

export function setCookieConsent(choice: CookieConsentChoice): void {
  safeStorage.setItem(KEY, choice);
}

export function setCookiePreferences(prefs: CookiePreferences): void {
  safeStorage.setItem(KEY, JSON.stringify({ mode: 'custom', prefs }));
}

export function hasConsent(): boolean {
  return getStored() !== null;
}

export function hasFullConsent(): boolean {
  return getStored() === 'all';
}

export function hasSearchHistoryConsent(): boolean {
  return getCookiePreferences().searchHistory;
}

export function hasSessionConsent(): boolean {
  return getCookiePreferences().session;
}

export function hasUserCityConsent(): boolean {
  return getCookiePreferences().city;
}

export function resetCookieConsent(): void {
  for (const k of NON_ESSENTIAL_KEYS) {
    safeStorage.removeItem(k);
  }
  safeStorage.removeItem(KEY);
}

export function clearPreferencesData(prefs: CookiePreferences): void {
  if (!prefs.searchHistory) safeStorage.removeItem('mastersSearchHistory');
  if (!prefs.session) safeStorage.removeItem('mh_session_id');
  if (!prefs.city) safeStorage.removeItem('userCityName');
}
