import {
  LS_HTTPONLY_SESSION_HINT_KEY,
  LS_HTTPONLY_SESSION_HINT_KEY_LEGACY,
} from '@/constants/storage';
import { safeStorage } from '@/utils/safeStorage';

export const REFRESH_TOKEN_KEY = 'faber.md.refreshToken';
const REMEMBER_ME_KEY = 'faber.md.rememberMe';
const LOGOUT_FLAG_KEY = 'faber.md.logout';
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

// ==================== Remember Me ====================

export function persistRememberMe(value: boolean): void {
  safeStorage.setItem(REMEMBER_ME_KEY, value ? '1' : '0');
}

export function loadRememberMe(): boolean {
  return safeStorage.getItem(REMEMBER_ME_KEY) === '1';
}

// ==================== Refresh Token ====================

function sessionGet(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
  } catch { return null; }
}

function sessionSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value);
  } catch { /* */ }
}

function sessionRemove(key: string): void {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(key);
  } catch { /* */ }
}

export function loadPersistedRefreshToken(): string | null {
  // Проверяем localStorage (rememberMe=true)
  const fromLS = safeStorage.getItem(REFRESH_TOKEN_KEY);
  if (fromLS && fromLS.trim()) return fromLS;
  // Проверяем sessionStorage (rememberMe=false)
  const fromSS = sessionGet(REFRESH_TOKEN_KEY);
  if (fromSS && fromSS.trim()) return fromSS;
  return null;
}

export function persistRefreshToken(refreshToken: string | null, rememberMe?: boolean) {
  if (refreshToken && refreshToken.trim()) {
    const remember = rememberMe ?? loadRememberMe();
    if (remember) {
      safeStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      sessionRemove(REFRESH_TOKEN_KEY);
    } else {
      sessionSet(REFRESH_TOKEN_KEY, refreshToken);
      safeStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } else {
    // Очистка: удаляем из обоих хранилищ
    safeStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionRemove(REFRESH_TOKEN_KEY);
  }
}

// ==================== Logout Flag ====================

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
