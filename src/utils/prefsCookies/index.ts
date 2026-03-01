/**
 * Куки для настроек (язык, тема). Сохраняются при смене пользователем и восстанавливаются после F5.
 */

const MAX_AGE_DAYS = 365;

function setCookie(name: string, value: string): void {
  try {
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
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
    key: 'mm_lang',
    get: () => getCookie('mm_lang'),
    set: (value: string) => setCookie('mm_lang', value),
  },
  theme: {
    key: 'mm_theme',
    get: () => getCookie('mm_theme'),
    set: (value: string) => setCookie('mm_theme', value),
  },
};
