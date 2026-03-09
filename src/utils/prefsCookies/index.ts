const MAX_AGE_DAYS = 365;
const IS_SECURE = window.location.protocol === 'https:';

function setCookie(name: string, value: string): void {
  try {
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
    let cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    if (IS_SECURE) cookie += '; Secure';
    document.cookie = cookie;
  } catch {
    //
  }
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
    set: (value: string) => setCookie('mh_lang', value),
  },
  theme: {
    key: 'master_hub_theme',
    get: () => getCookie('mh_theme'),
    set: (value: string) => setCookie('mh_theme', value),
  },
};
