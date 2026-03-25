const MAX_AGE_DAYS = 365;
const IS_SECURE = window.location.protocol === 'https:';

export function setHttpCookie(name: string, value: string): void {
  try {
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
    let cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    if (IS_SECURE) cookie += '; Secure';
    document.cookie = cookie;
  } catch {
    //
  }
}

function clearCookie(name: string): void {
  try {
    let cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    if (IS_SECURE) cookie += '; Secure';
    document.cookie = cookie;
  } catch {
    //
  }
}

/** Mirrors consent choice in an HTTP cookie so DevTools → Cookies shows a record (localStorage remains source of truth). */
const CONSENT_MODE_COOKIE = 'mh_consent_mode';

export function setConsentModeCookie(mode: 'all' | 'necessary' | 'custom'): void {
  setHttpCookie(CONSENT_MODE_COOKIE, mode);
}

export function clearConsentModeCookie(): void {
  clearCookie(CONSENT_MODE_COOKIE);
}

function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export const prefsCookies = {
  lang: {
    key: 'mh_lang',
    get: () => getCookie('mh_lang'),
    set: (value: string) => setHttpCookie('mh_lang', value),
  },
  theme: {
    key: 'master_hub_theme',
    get: () => getCookie('mh_theme'),
    set: (value: string) => setHttpCookie('mh_theme', value),
  },
};

export { clearCookie as clearHttpCookie };
