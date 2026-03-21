import { safeStorage } from '@/utils/safeStorage';

export const REFRESH_TOKEN_KEY = 'master-hub.refreshToken';
const LOGOUT_FLAG_KEY = 'master-hub.logout';
/** httpOnly: '0' = нет сессии, не дергать /auth/refresh на bootstrap; '1' / отсутствует = можно пробовать cookie */
const HTTPONLY_SESSION_HINT_KEY = 'master-hub.httpOnlySessionHint';

export function markHttpOnlySessionHint(present: boolean): void {
  safeStorage.setItem(HTTPONLY_SESSION_HINT_KEY, present ? '1' : '0');
}

export function isHttpOnlyGuestHint(): boolean {
  return safeStorage.getItem(HTTPONLY_SESSION_HINT_KEY) === '0';
}

export function loadPersistedRefreshToken(): string | null {
  const v = safeStorage.getItem(REFRESH_TOKEN_KEY);
  return v && v.trim() ? v : null;
}

export function persistRefreshToken(refreshToken: string | null) {
  if (refreshToken && refreshToken.trim()) safeStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  else safeStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function setLogoutFlag() {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(LOGOUT_FLAG_KEY, '1');
  } catch {
    //
  }
}

export function takeLogoutFlag(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const v = window.sessionStorage.getItem(LOGOUT_FLAG_KEY);
    window.sessionStorage.removeItem(LOGOUT_FLAG_KEY);
    return v === '1';
  } catch {
    return false;
  }
}
