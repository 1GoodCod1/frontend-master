import {
  LS_HTTPONLY_SESSION_HINT_KEY,
  LS_HTTPONLY_SESSION_HINT_KEY_LEGACY,
} from '@/constants/storage';
import { safeStorage } from '@/utils/safeStorage';

export const REFRESH_TOKEN_KEY = 'master-hub.refreshToken';
const LOGOUT_FLAG_KEY = 'master-hub.logout';
/** httpOnly: '0' = нет сессии, не дергать /auth/refresh на bootstrap; '1' / отсутствует = можно пробовать cookie */

function readHttpOnlySessionHint(): string | null {
  let v = safeStorage.getItem(LS_HTTPONLY_SESSION_HINT_KEY);
  if (v !== null) {
    safeStorage.removeItem(LS_HTTPONLY_SESSION_HINT_KEY_LEGACY);
    return v;
  }
  v = safeStorage.getItem(LS_HTTPONLY_SESSION_HINT_KEY_LEGACY);
  if (v !== null) {
    safeStorage.setItem(LS_HTTPONLY_SESSION_HINT_KEY, v);
    safeStorage.removeItem(LS_HTTPONLY_SESSION_HINT_KEY_LEGACY);
  }
  return v;
}

export function markHttpOnlySessionHint(present: boolean): void {
  const value = present ? '1' : '0';
  safeStorage.setItem(LS_HTTPONLY_SESSION_HINT_KEY, value);
  safeStorage.removeItem(LS_HTTPONLY_SESSION_HINT_KEY_LEGACY);
}

export function isHttpOnlyGuestHint(): boolean {
  return readHttpOnlySessionHint() === '0';
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
