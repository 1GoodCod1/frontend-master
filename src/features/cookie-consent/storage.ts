const KEY = 'mh_cookie_consent';

export type CookieConsentChoice = 'all' | 'necessary';

export function getCookieConsent(): CookieConsentChoice | null {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'all' || v === 'necessary') return v;
    return null;
  } catch {
    return null;
  }
}

export function setCookieConsent(choice: CookieConsentChoice): void {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    //
  }
}

export function hasConsent(): boolean {
  return getCookieConsent() !== null;
}
