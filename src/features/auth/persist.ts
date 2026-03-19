import { safeStorage } from '@/utils/safeStorage';

export const REFRESH_TOKEN_KEY = 'master-hub.refreshToken';
const LOGOUT_FLAG_KEY = 'master-hub.logout';

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
